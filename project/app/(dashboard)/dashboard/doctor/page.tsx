import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { appointments, doctors } from '@/lib/db/schema';
import { Users, Clock, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default async function DoctorHub({ userId }: { userId: string }) {
  // Fetch the doctor's verification status
  const doctorProfile = await db.query.doctors.findFirst({
    where: eq(doctors.id, userId)
  });

  // Fetch today's pending or confirmed sessions
  const activeSchedules = await db.query.appointments.findMany({
    where: eq(appointments.doctorId, userId),
    with: { patient: true }
  });

  return (
    <div className="space-y-8">
      {/* Clinical Metrics Block */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Users className="h-6 w-6" /></div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Assigned Patients</p>
            <p className="text-2xl font-bold text-slate-900">{activeSchedules.length}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg"><Clock className="h-6 w-6" /></div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Pending Approvals</p>
            <p className="text-2xl font-bold text-slate-900">
              {activeSchedules.filter(a => a.status === 'pending').length}
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><ShieldCheck className="h-6 w-6" /></div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Credential Status</p>
            <p className={`text-sm font-bold mt-1 ${doctorProfile?.isVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
              {doctorProfile?.isVerified ? 'Verified Account' : 'Pending Verification'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Worklist */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="font-bold text-slate-900 text-lg mb-4">Today's Consultation Schedule Queue</h2>
        {activeSchedules.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">Your calendar is open. No appointments booked for today.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-medium">
                  <th className="pb-3">Patient Name</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeSchedules.map((session) => (
                  <tr key={session.id} className="text-slate-700">
                    <td className="py-3.5 font-medium text-slate-900">
                      {session.patient.firstName} {session.patient.lastName}
                    </td>
                    <td className="py-3.5">
                      <span className="text-xs bg-slate-100 px-2 py-0.5 rounded capitalize">{session.status}</span>
                    </td>
                    <td className="py-3.5 text-right">
                      <Link href={`/dashboard/consultations/${session.id}`} className="inline-flex text-xs font-semibold bg-blue-50 text-blue-700 px-3 py-1.5 rounded hover:bg-blue-100 transition">
                        Enter Room
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}