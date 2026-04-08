import React, { useState, useContext } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'https://ai-financial-copilot-ckt8.onrender.com/api';
import { X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

function AddTransactionModal({ isOpen, onClose, onSuccess, initialData = null }) {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'Housing',
    type: 'expense',
    date: new Date().toISOString().split('T')[0] // yyyy-mm-dd
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorDetails, setErrorDetails] = useState('');

  // Sync initialization state payload if entering 'Edit' mode
  React.useEffect(() => {
     if (initialData) {
         setFormData({
             description: initialData.description || '',
             amount: initialData.amount ? Math.abs(initialData.amount).toString() : '',
             category: initialData.category || 'Housing',
             type: initialData.type || 'expense',
             date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
         });
     } else {
         setFormData({
            description: '', amount: '', category: 'Housing', type: 'expense', date: new Date().toISOString().split('T')[0]
         });
     }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (initialData && initialData._id) {
          await axios.put(`${API}/transactions/${initialData._id}`, formData);
      } else {
          await axios.post(`${API}/transactions`, formData);
      }
      onSuccess(); // Re-fetch data
      onClose(); // Close modal
      setFormData({
        description: '',
        amount: '',
        category: 'Housing',
        type: 'expense',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      console.error("Error saving transaction", err);
      if (err.response && err.response.status === 404) {
          setErrorDetails("Backend server requires a restart to load new endpoints.");
      } else {
          setErrorDetails(err.response?.data?.error || "Failed to sync to database.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="glass-card animate-fade-in premium-modal" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex-between mb-6">
           <h2 style={{ fontSize: '1.25rem' }}>{initialData ? 'Edit Transaction' : 'Add Transaction'}</h2>
           <button onClick={onClose} style={{background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer'}}>
             <X />
           </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="text-muted" style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem'}}>Type</label>
            <div style={{display: 'flex', gap: '1rem'}}>
              <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <input type="radio" name="type" value="expense" checked={formData.type === 'expense'} onChange={handleChange} />
                Expense
              </label>
              <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <input type="radio" name="type" value="income" checked={formData.type === 'income'} onChange={handleChange} />
                Income
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label className="text-muted" style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem'}}>Description</label>
            <input 
              type="text" name="description" value={formData.description} onChange={handleChange} required
              className="form-input"
            />
          </div>

          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}} className="mb-4">
            <div>
              <label className="text-muted" style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem'}}>Amount ({user?.currency || 'USD'})</label>
              <input 
                type="number" step="0.01" name="amount" value={formData.amount} onChange={handleChange} required
                className="form-input"
              />
            </div>
            <div>
              <label className="text-muted" style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem'}}>Date</label>
              <input 
                type="date" name="date" value={formData.date} onChange={handleChange} required
                className="form-input"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="text-muted" style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem'}}>Category</label>
            <select 
              name="category" value={formData.category} onChange={handleChange}
              className="form-input"
            >
              <option value="Income">Income</option>
              <option value="Housing">Housing</option>
              <option value="Food">Food</option>
              <option value="Utilities">Utilities</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Transport">Transport</option>
              <option value="Shopping">Shopping</option>
            </select>
          </div>

          {errorDetails && <div className="text-danger mb-4" style={{fontSize: '0.85rem'}}>{errorDetails}</div>}

          <button type="submit" className="btn-primary" style={{width: '100%', padding: '1rem'}} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : (initialData ? 'Save Changes' : 'Add Transaction')}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default AddTransactionModal;
