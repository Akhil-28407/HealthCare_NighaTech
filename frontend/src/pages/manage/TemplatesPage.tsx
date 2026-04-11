import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templatesApi } from '../../api';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiSave, FiEye } from 'react-icons/fi';
import Editor from '@monaco-editor/react';

export default function TemplatesPage() {
  const queryClient = useQueryClient();
  const [showEditor, setShowEditor] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('lab_report');
  const [previewHtml, setPreviewHtml] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const { data } = useQuery({ queryKey: ['templates'], queryFn: () => templatesApi.getAll() });

  const createMutation = useMutation({
    mutationFn: (d: any) => templatesApi.create(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Template created successfully');
      setShowCreate(false);
      setName('');
      setContent('');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create template'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => templatesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Template saved successfully');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to save template'),
  });

  const selectTemplate = (tmpl: any) => {
    setSelectedId(tmpl._id);
    setContent(tmpl.content);
    setName(tmpl.name);
    setType(tmpl.type);
    setPreviewHtml('');
    setShowEditor(false); // Hide editor by default on selection
  };

  const previewTemplate = async () => {
    if (!selectedId) return;
    try {
      const { data } = await templatesApi.preview(selectedId);
      setPreviewHtml(data.html);
    } catch {
      toast.error('Preview failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Report Templates</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus /> {showCreate ? 'Close Editor' : 'New Template'}
        </button>
      </div>

      {showCreate && (
        <div className="glass-card p-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="Template name"
              />
            </div>
            <div>
              <label className="label">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="input-field"
              >
                <option value="lab_report">Lab Report</option>
                <option value="invoice">Invoice</option>
                <option value="quotation">Quotation</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label text-primary-300">HTML Code Editor</label>
            <div className="h-64 border border-surface-700/50 rounded-xl overflow-hidden focus-within:border-primary-500/50 transition-colors">
              <Editor
                height="100%"
                defaultLanguage="html"
                theme="vs-dark"
                value={content}
                onChange={(val) => setContent(val || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>
          </div>
          <button
            onClick={() => createMutation.mutate({ name, content, type })}
            className="btn-primary"
            disabled={!name || !content}
          >
            Create Template
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Template List */}
        <div className="space-y-2 lg:col-span-1">
          {data?.data?.length === 0 ? (
            <div className="glass-card p-4 text-center text-surface-400 text-sm">
              No templates found. Create one to get started.
            </div>
          ) : (
            data?.data?.map((tmpl: any) => (
              <button
                key={tmpl._id}
                onClick={() => selectTemplate(tmpl)}
                className={`w-full text-left p-4 rounded-xl transition-all ${
                  selectedId === tmpl._id
                    ? 'bg-primary-500/15 border border-primary-500/30'
                    : 'glass-card hover:border-surface-700'
                }`}
              >
                <p className="text-white font-medium truncate">{tmpl.name}</p>
                <span className="badge badge-primary mt-1 text-[10px] uppercase tracking-wider">{tmpl.type}</span>
              </button>
            ))
          )}
        </div>

        {/* Preview & Editor Area */}
        {selectedId ? (
          <div className="lg:col-span-3 space-y-6">
            <div className="glass-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex-1 min-w-[200px]">
                  <p className="text-xs text-surface-400 uppercase tracking-widest mb-1">Editing Template</p>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-transparent border-none text-xl font-bold text-white p-0 focus:ring-0 w-full"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowEditor(!showEditor)}
                    className={`btn-sm flex items-center gap-2 ${showEditor ? 'btn-primary' : 'btn-secondary bg-surface-800'}`}
                  >
                    <FiSave size={14} /> {showEditor ? 'Hide Code' : 'Edit Code / Input'}
                  </button>
                  <button
                    onClick={previewTemplate}
                    className="btn-sm btn-primary flex items-center gap-2 px-6"
                  >
                    <FiEye size={14} /> Update Preview
                  </button>
                  <button
                    onClick={() => updateMutation.mutate({ id: selectedId, data: { name, content, type } })}
                    className="btn-sm bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 flex items-center gap-2 px-6"
                    title="Save Changes"
                  >
                    <FiSave size={14} /> Save Changes
                  </button>
                </div>
              </div>

              {showEditor ? (
                <div className="h-[500px] border border-surface-700/50 rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                  <Editor
                    height="100%"
                    defaultLanguage="html"
                    theme="vs-dark"
                    value={content}
                    onChange={(val) => setContent(val || '')}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                    }}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-surface-300">Live Preview Rendering (A4 View)</h3>
                    {!previewHtml && <p className="text-xs text-surface-500 italic">Click "Update Preview" to see your changes</p>}
                  </div>
                  <div className="bg-surface-900/50 rounded-2xl p-4 lg:p-8 flex justify-center overflow-auto min-h-[600px] max-h-[800px] border border-white/5">
                    {previewHtml ? (
                      <div className="bg-white shadow-2xl origin-top transition-transform duration-500 hover:scale-[1.01]" style={{ width: '210mm', minHeight: '297mm', padding: '0' }}>
                        <iframe
                          title="Template Preview"
                          srcDoc={previewHtml}
                          className="w-full h-full border-none"
                          style={{ minHeight: '297mm', pointerEvents: 'none' }}
                        />
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-surface-400 space-y-4">
                        <div className="w-16 h-16 bg-surface-800 rounded-2xl flex items-center justify-center shadow-lg ring-1 ring-white/10 animate-pulse">
                          <FiEye size={24} className="text-primary-500" />
                        </div>
                        <p className="text-sm font-medium">Select Update Preview to render the high-fidelity document</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="lg:col-span-3 glass-card p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
            <div className="w-20 h-20 bg-surface-800 rounded-2xl flex items-center justify-center mb-6 shadow-xl ring-1 ring-white/5">
              <FiSave className="text-primary-400" size={32} />
            </div>
            <h3 className="text-xl font-bold text-white">Select a Template</h3>
            <p className="text-surface-400 max-w-xs mt-3">
              Manage your document structures for Lab Reports, Invoices, and Quotations. Select one to modify its high-fidelity layout.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
