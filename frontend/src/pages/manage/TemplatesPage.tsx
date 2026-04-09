import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templatesApi } from '../../api';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiSave, FiEye } from 'react-icons/fi';
import Editor from '@monaco-editor/react';

export default function TemplatesPage() {
  const queryClient = useQueryClient();
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
        <div className="glass-card p-6 space-y-4">
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
            <label className="label">Content (Handlebars HTML)</label>
            <div className="h-64 border border-surface-700/50 rounded-xl overflow-hidden">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template List */}
        <div className="space-y-2">
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
                <p className="text-white font-medium">{tmpl.name}</p>
                <span className="badge badge-primary mt-1">{tmpl.type}</span>
              </button>
            ))
          )}
        </div>

        {/* Editor */}
        {selectedId ? (
          <div className="lg:col-span-2 space-y-4">
            <div className="glass-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field flex-1 min-w-[200px]"
                />
                <div className="flex gap-2">
                  <button
                    onClick={previewTemplate}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <FiEye /> Preview
                  </button>
                  <button
                    onClick={() => updateMutation.mutate({ id: selectedId, data: { name, content, type } })}
                    className="btn-primary flex items-center gap-2"
                  >
                    <FiSave /> Save
                  </button>
                </div>
              </div>
              <div className="h-[500px] border border-surface-700/50 rounded-xl overflow-hidden">
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

            {previewHtml && (
              <div className="glass-card p-4">
                <h3 className="text-sm font-semibold text-surface-300 mb-3">Live Preview</h3>
                <div
                  className="bg-white rounded-xl p-6 overflow-auto max-h-[600px] text-black"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="lg:col-span-2 glass-card p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-surface-800 rounded-full flex items-center justify-center mb-4">
              <FiSave className="text-surface-400" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white">No Template Selected</h3>
            <p className="text-surface-400 max-w-xs mt-2">
              Select a template from the list on the left to start editing or create a new one.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
