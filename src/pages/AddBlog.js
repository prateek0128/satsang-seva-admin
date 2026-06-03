import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Loader from '../components/Loader';
import { toast } from '../components/Popup';

const S = {
  page: { padding: '28px 32px', background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter',-apple-system,sans-serif" },
  header: { marginBottom: '28px' },
  title: { margin: '0 0 4px', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' },
  subtitle: { margin: 0, fontSize: '0.8rem', color: '#94a3b8' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' },
  card: { background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', padding: '24px', marginBottom: '20px' },
  sectionTitle: { fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' },
  label: { display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '7px' },
  input: { width: '100%', padding: '11px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', color: '#334155', fontSize: '0.9rem', fontWeight: 500, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' },
  textarea: { width: '100%', padding: '11px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', color: '#334155', fontSize: '0.9rem', fontWeight: 500, outline: 'none', boxSizing: 'border-box', resize: 'vertical', minHeight: '180px', fontFamily: 'inherit' },
  submitBtn: { width: '100%', padding: '13px', background: 'linear-gradient(135deg, #D26600, #ea580c)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(210,102,0,0.25)', fontFamily: 'inherit' },
  cancelBtn: { width: '100%', padding: '11px', background: '#fff', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '10px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', marginTop: '10px', fontFamily: 'inherit' },
};

function AddBlog() {
  const url = process.env.REACT_APP_BACKEND;
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [images, setImages] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [uploadedBy, setUploadedBy] = useState('');
  const [blogPoster, setBlogPoster] = useState(null);
  const [existingImages, setExistingImages] = useState([]);

  useEffect(() => {
    if (!isEdit) return;
    const fetchBlog = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`${url}admin/blog/${id}`, { headers });
        const b = res.data.data;
        setTitle(b.title || '');
        setContent(b.content || '');
        setUploadedBy(b.uploadedBy || '');
        setExistingImages(b.images || []);
        if (b.images?.[0]) setImage(b.images[0]);
      } catch (err) {
        toast('Failed to load blog', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id, isEdit, url]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/jpeg': [], 'image/png': [], 'image/jpg': [], 'image/webp': [] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setBlogPoster(file);
        const reader = new FileReader();
        reader.onloadend = () => setImage(reader.result);
        reader.readAsDataURL(file);
      }
    },
  });

  const handleSubmit = async () => {
    if (!title.trim()) return toast('Blog title is required', 'error');
    if (!content.trim()) return toast('Blog content is required', 'error');
    if (!isEdit && !blogPoster) return toast('Blog poster image is required', 'error');

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('blogData', JSON.stringify({ title: title.trim(), content: content.trim(), uploadedBy: uploadedBy.trim() }));
      if (blogPoster) formData.append('images', blogPoster);
      images.slice(0, 9).forEach((img) => formData.append('images', img));
      if (isEdit) existingImages.forEach(img => formData.append('existingImages', img));

      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      if (isEdit) {
        await axios.put(`${url}admin/blog/${id}`, formData, { headers });
        toast('Blog updated successfully!', 'success');
      } else {
        await axios.post(`${url}admin/blog`, formData, { headers });
        toast('Blog created successfully!', 'success');
      }
      navigate('/admin/blog');
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to save blog', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      {loading && <Loader />}

      <div style={S.header}>
        <h1 style={S.title}>{isEdit ? 'Edit Blog Post' : 'Create Blog Post'}</h1>
        <p style={S.subtitle}>{isEdit ? 'Update and republish the blog' : 'Write and publish a new blog for the community'}</p>
      </div>

      <div style={S.grid}>
        {/* LEFT */}
        <div>
          {/* Cover Image */}
          <div style={S.card}>
            <div style={S.sectionTitle}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#D26600" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              Cover Image {!isEdit && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>*</span>}
            </div>
            <div
              {...getRootProps()}
              style={{
                width: '100%', height: image ? 'auto' : '220px',
                border: `2px dashed ${isDragActive ? '#D26600' : '#e2e8f0'}`,
                borderRadius: '12px',
                background: isDragActive ? '#fff7ed' : (image ? '#000' : '#f8fafc'),
                cursor: 'pointer', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                transition: 'all 0.2s',
              }}
            >
              <input {...getInputProps()} />
              {image ? (
                <img src={image} alt="Preview" style={{ width: '100%', maxHeight: '340px', objectFit: 'cover', borderRadius: '10px' }} />
              ) : (
                <>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '12px' }}>
                    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <p style={{ margin: '0 0 4px', fontWeight: 600, color: '#64748b', fontSize: '0.88rem' }}>
                    {isDragActive ? 'Drop image here' : 'Drag & drop or click to upload'}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>JPG, PNG, WEBP supported</p>
                </>
              )}
            </div>
            {image && (
              <button
                onClick={(e) => { e.stopPropagation(); setImage(null); setBlogPoster(null); }}
                style={{ marginTop: '10px', background: '#fee2e2', color: '#ef4444', border: 'none', padding: '7px 14px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Remove Image
              </button>
            )}
          </div>

          {/* Blog Details */}
          <div style={S.card}>
            <div style={S.sectionTitle}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#D26600" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              Blog Content
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <span style={S.label}>Blog Title <span style={{ color: '#ef4444' }}>*</span></span>
                <input style={S.input} type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter an engaging blog title..." />
              </div>
              <div>
                <span style={S.label}>Blog Content <span style={{ color: '#ef4444' }}>*</span></span>
                <textarea style={S.textarea} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your blog content here..." />
                <div style={{ textAlign: 'right', fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>{content.length} characters</div>
              </div>
            </div>
          </div>

          {/* Existing Images (edit mode) */}
          {isEdit && existingImages.length > 0 && (
            <div style={S.card}>
              <div style={S.sectionTitle}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#D26600" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                Current Images
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {existingImages.map((src, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={src} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 10, border: '1px solid #e2e8f0' }} />
                    <button onClick={() => setExistingImages(prev => prev.filter((_, j) => j !== i))}
                      style={{ position: 'absolute', top: -5, right: -5, width: 20, height: 20, borderRadius: '50%', background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Images */}
          <div style={S.card}>
            <div style={S.sectionTitle}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#D26600" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 5 17 10"/><line x1="12" y1="5" x2="12" y2="17"/></svg>
              {isEdit ? 'Add More Images' : 'Additional Images'} <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(max 9)</span>
            </div>
            <input type="file" accept="image/*" multiple onChange={(e) => setImages(Array.from(e.target.files || []).slice(0, 9))}
              style={{ ...S.input, padding: '9px 14px', cursor: 'pointer' }} />
            {images.length > 0 && (
              <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {images.map((f, i) => (
                  <div key={i} style={{ background: '#f1f5f9', borderRadius: '8px', padding: '5px 10px', fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>{f.name}</div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT sidebar */}
        <div>
          <div style={S.card}>
            <div style={S.sectionTitle}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#D26600" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Author Info
            </div>
            <div>
              <span style={S.label}>Shared By <span style={{ color: '#94a3b8', fontWeight: 400, textTransform: 'none' }}>(optional)</span></span>
              <input style={S.input} type="text" value={uploadedBy} onChange={(e) => setUploadedBy(e.target.value)} placeholder="e.g. SatsangSeva Team" />
              <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '8px', marginBottom: 0 }}>This name will appear as the blog author.</p>
            </div>
          </div>

          <div style={S.card}>
            <div style={S.sectionTitle}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#D26600" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              Checklist
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Cover image uploaded', done: !!blogPoster || (isEdit && existingImages.length > 0) },
                { label: 'Blog title filled', done: title.trim().length > 0 },
                { label: 'Blog content written', done: content.trim().length > 0 },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: item.done ? '#16a34a' : '#94a3b8', fontWeight: item.done ? 600 : 400 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: item.done ? '#dcfce7' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {item.done
                      ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      : <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#cbd5e1' }} />
                    }
                  </div>
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          <div style={S.card}>
            <button onClick={handleSubmit} disabled={loading} style={{ ...S.submitBtn, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Saving...' : isEdit ? 'Update Blog' : 'Publish Blog'}
            </button>
            <button onClick={() => navigate(-1)} style={S.cancelBtn}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddBlog;
