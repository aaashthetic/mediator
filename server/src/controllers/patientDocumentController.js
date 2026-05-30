import { db } from '../config/db.js';
import { patientDocuments } from '../db/schema.js';
import { eq, and, desc, count } from 'drizzle-orm';

// Helper function to format human-readable document details
const formatDocumentMetadata = (createdAtTimestamp, rawSizeString) => {
  const createdDate = createdAtTimestamp ? new Date(createdAtTimestamp) : new Date();
  
  // Format to standard readable layout strings
  const formattedDate = createdDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit"
  });

  return {
    uploadedAt: formattedDate,
    displaySize: rawSizeString || "0.0 MB",
  };
};

// Fetch a list of user documents
export const getDocuments = async (req, res, next) => {
  try {
    const { patientId, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    if (!patientId) {
      return res.status(400).json({ error: "Missing identity scoping parameter: patientId" });
    }

    console.log("QUERYING DOCUMENTS FOR USER:", patientId);

    const whereClause = eq(patientDocuments.patientId, patientId);

    // Concurrently execute database listing queries alongside count tracking metrics
    const [rawRows, [countRecord]] = await Promise.all([
      db.select()
        .from(patientDocuments)
        .where(whereClause)
        .limit(Number(limit))
        .offset(offset)
        .orderBy(desc(patientDocuments.createdAt)),

      db.select({ total: count() }).from(patientDocuments).where(whereClause)
    ]);

    const totalItems = countRecord?.total || 0;

    // Standardize object structures to client response payloads
    const documentList = rawRows.map((row) => {
      const meta = formatDocumentMetadata(row.createdAt, row.fileSize);
      return {
        id: row.id,
        name: row.fileName,
        size: meta.displaySize,
        date: meta.uploadedAt,
        fileUrl: row.fileUrl
      };
    });

    return res.status(200).json({
      meta: {
        totalItems,
        currentPage: Number(page),
        totalPages: Math.ceil(totalItems / Number(limit)),
      },
      documents: documentList,
    });
  } catch (error) {
    next(error);
  }
};


// Log asset payload configurations to the database
export const createDocument = async (req, res, next) => {
  try {
    // Rely on context session credentials if injected, fallback safely to standard request bodies
    const patientId = req.userId || req.body.patientId;
    const file = req.file;

    if (!patientId) {
      return res.status(401).json({ error: "Unauthorized access or missing patient identity" });
    }

    if (!file) {
      return res.status(400).json({ error: "Missing required payload tracking strings: fileUrl or fileName" });
    }

    const fileBytes = file.size;
    const formattedSize = `${(fileBytes / (1024 * 1024)).toFixed(1)} MB`;
    const fallbackStorageUrl = `https://storage.mediator.live/uploads/${Date.now()}-${file.originalname}`;

    // Insert structural row object using returning values patterns
    const [insertedDocument] = await db
      .insert(patientDocuments)
      .values({
        patientId,
        fileUrl: fallbackStorageUrl,
        fileName: file.originalname,
        fileSize: formattedSize,
      })
      .returning();

    const meta = formatDocumentMetadata(insertedDocument.createdAt, insertedDocument.fileSize);

    return res.status(201).json({
      success: true,
      message: "Health repository material logged securely",
      document: {
        id: insertedDocument.id,
        name: insertedDocument.fileName,
        size: insertedDocument.fileSize,
        date: meta.uploadedAt,
        fileUrl: insertedDocument.fileUrl
      },
    });
  } catch (error) {
    next(error);
  }
};

// Permanently purge a repository asset record using an ACID transaction framework
export const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Missing document identifier path target" });
    }

    await db.transaction(async (tx) => {
      // Validate targeted row presence before initiating data destruction operations
      const [currentDocument] = await tx
        .select()
        .from(patientDocuments)
        .where(eq(patientDocuments.id, id));

      if (!currentDocument) {
        throw new Error("DOCUMENT_NOT_FOUND");
      }

      // Execute permanent database row deletion
      await tx
        .delete(patientDocuments)
        .where(eq(patientDocuments.id, id));
    });

    return res.status(200).json({
      success: true,
      message: "Document row registry dropped from ledger systems",
    });
  } catch (error) {
    if (error.message === "DOCUMENT_NOT_FOUND") {
      return res.status(404).json({ error: "The targeted document asset reference entry does not exist" });
    }
    next(error);
  }
};