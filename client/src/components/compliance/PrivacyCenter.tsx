import { useWealthStore } from '../../store/wealthStore';

export default function PrivacyCenter() {
  const consents = useWealthStore((s) => s.consents);
  const revokeConsent = useWealthStore((s) => s.revokeConsent);
  const assets = useWealthStore((s) => s.assets);
  const linkedAssets = assets.filter((a) => a.linkedViaAA);
  const activeConsents = consents.filter((c) => c.status === 'ACTIVE');
  const familyMembers = useWealthStore((s) => s.familyMembers);
  const familyDataSharing = useWealthStore((s) => s.familyDataSharing);
  const toggleFamilyDataSharing = useWealthStore((s) => s.toggleFamilyDataSharing);

  return (
    <div className="card">
      <h3 className="font-semibold text-slate-800 dark:text-white mb-4">
        <i className="fas fa-user-shield text-primary mr-2" /> Privacy Center
      </h3>

      <div className="space-y-6">
        {/* Manage Consents Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-200">Manage Consents</h4>
            {activeConsents.length > 0 && (
              <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-full font-medium">
                {activeConsents.length} Active
              </span>
            )}
          </div>

          {/* Linked Accounts */}
          {linkedAssets.length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] uppercase tracking-wide text-slate-400 font-medium mb-2">Linked Accounts</p>
              <div className="space-y-2">
                {linkedAssets.map((asset) => (
                  <div key={asset.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary text-xs">
                        <i className="fas fa-building-columns" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-200">{asset.name}</p>
                        <p className="text-[10px] text-slate-400">₹{asset.value.toLocaleString()}</p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-full">
                      <i className="fas fa-link mr-1" />Active
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Consent Records */}
          {consents.length === 0 ? (
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
              <i className="fas fa-file-shield text-slate-300 text-xl mb-2" />
              <p className="text-xs text-slate-400">No AA consent records yet.</p>
              <p className="text-[10px] text-slate-400 mt-1">Link an external account to create a consent record.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {consents.map((c) => (
                <div key={c.consentId} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-200">{c.purpose}</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${c.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                        {c.status}
                      </span>
                      {c.status === 'ACTIVE' && (
                        <button
                          onClick={() => revokeConsent(c.consentId)}
                          className="text-[10px] text-rose-500 hover:text-rose-600 font-medium"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400">
                    <span><i className="fas fa-database mr-1" />{c.dataScope.length} scopes</span>
                    <span><i className="fas fa-clock mr-1" />{c.validityDays} days</span>
                    <span><i className="fas fa-calendar mr-1" />{new Date(c.grantedAt).toLocaleDateString('en-IN')}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {c.dataScope.map((scope) => (
                      <span key={scope} className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded">
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Family Data Sharing */}
        <div>
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
            <i className="fas fa-people-group text-primary mr-1.5" />Family Data Sharing
          </h4>
          <div className="space-y-2">
            {familyMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary text-[10px] font-bold">
                    {member.avatar}
                  </div>
                  <div>
                    <p className="text-sm text-slate-700 dark:text-slate-200">{member.name}</p>
                    <p className="text-[10px] text-slate-400">{member.relation}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleFamilyDataSharing(member.id)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    familyDataSharing[member.id] ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    familyDataSharing[member.id] ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            When enabled, family members can view your net worth, goals, and protection alerts. They cannot perform transactions.
          </p>
        </div>

        {/* Data Permissions */}
        <div>
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Data Permissions</h4>
          <div className="space-y-2">
            {['Net Worth', 'Transaction History', 'Investment Holdings', 'Goal Progress', 'Market Preferences'].map((scope) => (
              <div key={scope} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <span className="text-sm text-slate-700 dark:text-slate-300">{scope}</span>
                <span className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-600 rounded-full">Granted</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
          <p className="text-xs text-primary font-medium mb-1"><i className="fas fa-lock mr-1" /> Security Status</p>
          <p className="text-xs text-slate-600 dark:text-slate-400">All data is encrypted at rest and in transit. We use AES-256 encryption and never share your data with third parties without explicit consent.</p>
        </div>
      </div>
    </div>
  );
}
