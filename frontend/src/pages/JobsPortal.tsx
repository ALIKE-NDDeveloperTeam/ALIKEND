import { useState, useMemo, DragEvent, ChangeEvent, FormEvent } from 'react';
import { Briefcase, MapPin, DollarSign, Clock, FilePlus, ChevronRight, Sparkles } from 'lucide-react';
import { Job } from '../types';
import GlassCloseButton from '../components/GlassCloseButton';

interface JobsPortalProps {
  jobs: Job[];
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function JobsPortal({ jobs: initialJobs, showToast }: JobsPortalProps) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [appliedJobIds, setAppliedJobIds] = useState<number[]>([]);

  // Filter conditions
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSector, setSelectedSector] = useState<string>('all');

  // Application Modal fields
  const [appFormOpen, setAppFormOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [resumeName, setResumeName] = useState<string | null>(null);
  const [coverNote, setCoverNote] = useState('');

  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      if (selectedType !== 'all' && j.type !== selectedType) return false;
      if (selectedSector !== 'all' && j.category !== selectedSector) return false;
      return true;
    });
  }, [jobs, selectedType, selectedSector]);

  const handleApplyClick = (job: Job) => {
    setSelectedJob(job);
    setAppFormOpen(true);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      setResumeName(files[0].name);
      showToast(`Captured draft PDF: ${files[0].name}`, 'success');
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setResumeName(files[0].name);
      showToast(`Selected PDF document: ${files[0].name}`, 'success');
    }
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    if (!resumeName) {
      showToast('Please attach your curriculum vitae resume PDF to apply.', 'error');
      return;
    }

    setAppliedJobIds([...appliedJobIds, selectedJob.id]);
    setAppFormOpen(false);
    showToast(`Application for ${selectedJob.title} submitted! Our boutique team is reviewing portfolio files.`, 'success');

    // Reset fields
    setFullName('');
    setEmail('');
    setPortfolio('');
    setResumeName(null);
    setCoverNote('');
  };

  return (
    <div id="jobs-portal-root" className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Visual Header */}
      <div className="border border-solid border-[#F5A623]/40 rounded-2xl p-6 bg-gradient-to-tr from-[#F5F2EB] via-[#E9E9E7] to-[#FAF8F5] text-center space-y-3 relative overflow-hidden shadow-sm" id="jobs-intro-panel">
        <span className="text-[#B45309] text-[10px] font-mono tracking-widest uppercase font-black block">Elite Atelier Openings</span>
        <h1 className="text-xl sm:text-3xl font-black text-[#0F1A3C] uppercase select-none tracking-wide">
          Alike Luxury <span className="text-[#F5A623]">Careers Board</span>
        </h1>
        <p className="text-xs text-neutral-600 max-w-lg mx-auto leading-relaxed font-medium">
          Unlock elite operational listings, logistic transport positions, diamond assayers, or horlogerie engineering nodes within our luxury network.
        </p>
        <div className="absolute top-0 left-0 w-32 h-32 bg-[#F5A623]/15 blur-2xl rounded-full pointer-events-none"></div>
      </div>

      {/* Filter and Content Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left column filter checklist */}
        <aside className="lg:col-span-3 bg-neutral-900 border border-solid border-neutral-850 p-4 rounded-xl space-y-6">
          <h3 className="text-xs uppercase tracking-widest font-extrabold text-white pb-2.5 border-b border-solid border-neutral-850">
            Career Filters
          </h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Employ Type</span>
              <div className="flex flex-wrap gap-2">
                {['all', 'Full-time', 'Contract', 'Consulting'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedType(t)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border border-solid transition-colors ${
                      selectedType === t
                        ? 'border-[#D1D1D1] bg-[#D1D1D1]/10 text-[#D1D1D1]'
                        : 'border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {t === 'all' ? 'All Types' : t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-solid border-neutral-850">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Guild Sectors</span>
              <div className="flex flex-col gap-1.5">
                {[
                  { id: 'all', label: 'All Guild Sectors' },
                  { id: 'Atelier Logistics', label: 'Atelier Logistics' },
                  { id: 'Watch Restoration', label: 'Watch Restoration' },
                  { id: 'Boutique Operations', label: 'Boutique Operations' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSector(s.id)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      selectedSector === s.id
                        ? 'bg-[#D1D1D1]/15 text-white'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Right column listings */}
        <section className="lg:col-span-9 space-y-4" id="jobs-listing-grid">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12 text-xs text-neutral-500 border border-solid border-neutral-850 rounded-xl bg-neutral-950/40">
              No matching listings in this sector currently. Verify active filter checkers.
            </div>
          ) : (
            filteredJobs.map((j) => {
              const applied = appliedJobIds.includes(j.id);
              return (
                <div
                  key={j.id}
                  id={`job-card-${j.id}`}
                  className="p-5 bg-neutral-900 border border-solid border-neutral-850 hover:border-[#D1D1D1]/40 rounded-xl transition-all duration-300 hover:shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden group"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 bg-neutral-950 text-neutral-400 text-[9px] uppercase font-mono font-bold tracking-wider rounded border border-solid border-neutral-800">
                        {j.company} Atelier
                      </span>
                      <span className="px-2 py-0.5 bg-[#D1D1D1]/10 text-white text-[9px] uppercase font-bold rounded">
                        {j.type}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-md font-bold text-white group-hover:text-[#D1D1D1] transition-colors leading-tight">
                      {j.title}
                    </h3>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-neutral-500 text-xs font-semibold">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {j.location}
                      </span>
                      <span className="flex items-center gap-1 text-[#D1D1D1]">
                        <DollarSign className="w-3.5 h-3.5" /> {j.salary} / month
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Registered: {j.dateAdded || 'Active'}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-400 leading-relaxed max-w-xl font-medium">
                      Description: {j.shortDesc || j.description}
                    </p>
                  </div>

                  {/* Actions buttons */}
                  <div className="z-10 shrink-0 self-stretch sm:self-auto flex items-center">
                    <button
                      id={`apply-job-btn-${j.id}`}
                      disabled={applied}
                      onClick={() => handleApplyClick(j)}
                      className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                        applied
                          ? 'bg-green-500/10 text-green-400 border border-solid border-green-500/20 cursor-default'
                          : 'bg-gradient-to-r from-white to-[#D1D1D1] text-black hover:opacity-95'
                      }`}
                    >
                      {applied ? '✓ Application Locked' : 'Safe Apply Now'}
                    </button>
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/2 opacity-0 group-hover:opacity-100 transition-opacity blur-3xl rounded-full"></div>
                </div>
              );
            })
          )}
        </section>
      </div>

      {/* JOB APPLICATION SUBMIT MODAL */}
      {appFormOpen && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in text-white">
          <div className="bg-neutral-900 border border-solid border-[#D1D1D1] rounded-2xl p-6 max-w-md w-full relative space-y-5 shadow-2xl">
            <GlassCloseButton
              id="close-job-modal"
              onClick={() => setAppFormOpen(false)}
              className="absolute top-4 right-4 z-10"
              size="sm"
              title="Close modal"
            />

            <div className="space-y-1">
              <span className="text-[9px] uppercase tracking-widest text-[#D1D1D1] font-black font-mono block">Apply secure dossier</span>
              <h3 className="text-sm font-black text-white leading-tight uppercase mr-6">
                Applying: {selectedJob.title}
              </h3>
              <p className="text-xs text-neutral-500 font-semibold">{selectedJob.company} Atelier Guild</p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-bold text-neutral-400">Your Full Name</label>
                  <input
                    id="app-form-name"
                    type="text"
                    required
                    placeholder="Candidate Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-2.5 bg-neutral-950 border border-solid border-neutral-800 rounded focus:border-[#D1D1D1] focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-bold text-neutral-400">Communication Mail</label>
                  <input
                    id="app-form-email"
                    type="email"
                    required
                    placeholder="Candidate Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 bg-neutral-950 border border-solid border-neutral-800 rounded focus:border-[#D1D1D1] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-bold text-neutral-400">Credentials Portfolio Link</label>
                <input
                  id="app-form-portfolio"
                  type="url"
                  placeholder="e.g. https://linkedin.com/in/cvRef"
                  value={portfolio}
                  onChange={(e) => setPortfolio(e.target.value)}
                  className="w-full p-2.5 bg-neutral-950 border border-solid border-neutral-800 rounded focus:border-[#D1D1D1] focus:outline-none"
                />
              </div>

              {/* Secure Drag and Drop file Uploader */}
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-bold text-neutral-400">Attachment Dossier Resume PDF</label>
                <div
                  id="resume-drag-uploader"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="p-5 border border-dashed border-neutral-750 hover:border-[#D1D1D1] rounded-xl bg-neutral-950/40 text-center cursor-pointer transition-colors text-xs text-neutral-500 font-medium"
                >
                  <input
                    type="file"
                    id="hidden-file-input"
                    accept=".pdf,.docx,.doc"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label htmlFor="hidden-file-input" className="cursor-pointer">
                    <FilePlus className="w-6 h-6 mx-auto text-[#D1D1D1] mb-2 hover:scale-104 transition-transform" />
                    {resumeName ? (
                      <span className="text-green-400 font-bold block">{resumeName} (Attached ✓)</span>
                    ) : (
                      <>
                        <span className="text-neutral-400">Click to browse files</span> or drag and drop your curriculum vitae file
                      </>
                    )}
                    <span className="block text-[10px] text-neutral-600 mt-1">Supports PDF, DOCX up to 5MB size</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-bold text-neutral-400">Short Motivational Essay</label>
                <textarea
                  id="app-form-note"
                  rows={3}
                  placeholder="Share details of your design, logistic corridors or watch restoration expertise"
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  className="w-full p-2.5 bg-neutral-950 border border-solid border-neutral-800 rounded focus:border-[#D1D1D1] focus:outline-none resize-none"
                />
              </div>

              <button
                id="submit-job-form-btn"
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-[#ffffff] via-[#E5E5E5] to-[#D1D1D1] text-black font-extrabold uppercase tracking-widest rounded-xl transition-all active:scale-95 text-xs flex justify-center items-center gap-1"
              >
                Submit Career Case <Sparkles className="w-4 h-4 animate-spin-slow" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
