import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { List, Plus, Trash2, Edit2 } from 'lucide-react';
import AddTransactionModal from '../components/AddTransactionModal';
import { AuthContext } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatCurrency';

function Transactions() {
  const { user } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const handleOpenEdit = (t) => {
     setEditingTransaction(t);
     setIsModalOpen(true);
  };

  const handleCloseModal = () => {
     setIsModalOpen(false);
     setEditingTransaction(null);
  };

  const fetchTransactions = () => {
    axios.get('/api/transactions')
      .then(res => setTransactions(res.data))
      .catch(err => {
        console.warn('Backend unavailable, falling back to local data', err);
        setTransactions(prev => prev.length > 0 ? prev : [
          { _id: '1', date: new Date().toISOString(), description: 'Salary', category: 'Income', amount: 4500, type: 'income' },
          { _id: '2', date: new Date(Date.now() - 86400000).toISOString(), description: 'Rent', category: 'Housing', amount: -1500, type: 'expense' },
          { _id: '3', date: new Date(Date.now() - 172800000).toISOString(), description: 'Groceries', category: 'Food', amount: -320, type: 'expense' },
        ]);
      });
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;
    
    // Update UI optimistically so delete operates instantaneously
    setTransactions(prev => prev.filter(t => t._id !== id));

    try {
      await axios.delete(`/api/transactions/${id}`);
    } catch (err) {
      console.warn('Backend delete sync failed, persisting locally for session', err);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex-between mb-8">
        <div>
          <h1 className="mb-2 flex-center" style={{fontSize: '2rem'}}>Transactions</h1>
          <p className="text-muted">All your past activity.</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Add
        </button>
      </div>

      <div className="glass-card table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th style={{textAlign: 'right'}}>Amount</th>
              <th style={{textAlign: 'right'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(t => (
              <tr key={t._id}>
                <td>{new Date(t.date).toLocaleDateString()}</td>
                <td><span style={{fontWeight: '500'}}>{t.description}</span></td>
                <td>
                  <span style={{background: 'var(--accent-soft)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', color: 'var(--text-muted)'}}>{t.category}</span>
                </td>
                <td style={{textAlign: 'right', color: t.type === 'income' ? 'var(--success)' : 'var(--text-main)', fontWeight: '500'}}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(t.amount), user?.currency)}
                </td>
                <td style={{textAlign: 'right'}}>
                  <button onClick={() => handleOpenEdit(t)} style={{background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px', marginRight: '8px', opacity: 0.7, transition: '0.2s'}} onMouseOver={e => e.currentTarget.style.opacity = 1} onMouseOut={e => e.currentTarget.style.opacity = 0.7}>
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(t._id)} style={{background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '6px', opacity: 0.7, transition: '0.2s'}} onMouseOver={e => e.currentTarget.style.opacity = 1} onMouseOut={e => e.currentTarget.style.opacity = 0.7}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddTransactionModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onSuccess={fetchTransactions}
        initialData={editingTransaction} 
      />
    </div>
  );
}

export default Transactions;
