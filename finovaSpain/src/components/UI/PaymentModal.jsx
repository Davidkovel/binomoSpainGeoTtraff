// src/components/ui/PaymentModal.jsx
import React, { useState, useEffect } from 'react';
import { CreditCard, X, Upload, Building2, User, Hash, Phone, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import "./PaymentModal.css";
import { CONFIG_API_BASE_URL } from '../config/constants';

const API_BASE_URL = CONFIG_API_BASE_URL;

export default function PaymentModal({ isOpen, onClose }) {
  const Navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cardLoading, setCardLoading] = useState(true);

  // Banco Pichincha реквизиты
  const [bankName, setBankName] = useState('');
  const [accountType, setAccountType] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [holderId, setHolderId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cardPhoto, setCardPhoto] = useState(null);


  const fetchCardNumber = async () => {
    try {
      setCardLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/api/user/card_number`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });


      if (response.status === 401) {
        // Токен недействителен или истёк
        localStorage.removeItem('access_token');
        onClose();
        Navigate('/login');
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        setBankName(data.bank_name || 'Banco Pichincha');
        setAccountType(data.account_type || 'Cuenta de ahorro transaccional');
        setAccountNumber(data.account_number || '2215000531');
        setCardHolderName(data.card_holder_name || 'Carlos Santiago Sarabia Garces');
        setHolderId(data.holder_id || '0605104458');
        setPhoneNumber(data.phone_number || '');
        
        if (data.photo_base64) {
          setCardPhoto(`data:${data.photo_mime_type || 'image/jpeg'};base64,${data.photo_base64}`);
        }
      } else {
        setFallbackData();
      }
    } catch (error) {
      console.error('Error fetching card data:', error);
      setFallbackData();
    } finally {
      setCardLoading(false);
    }
  };

  const setFallbackData = () => {
    setBankName('Banco Pichincha');
    setAccountType('Cuenta de ahorro transaccional');
    setAccountNumber('2215000531');
    setCardHolderName('Carlos Santiago Sarabia Garces');
    setHolderId('0605104458');
    setPhoneNumber('');
  };

  useEffect(() => {
    if (isOpen) {
      fetchCardNumber();
    }
  }, [isOpen]);

  if (!isOpen) return null;

   const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert("Sesión expirada. Inicia sesión nuevamente.");
        navigate("/login");
        return;
      }


      const formData = new FormData();
      
      formData.append('amount', amount);
      if (file) {
        formData.append('invoice_file', file);
      }

      const response = await fetch(`${API_BASE_URL}/api/user/send_invoice_to_tg`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });


      if (response.status === 401) {
        // Токен недействителен или истёк
        localStorage.removeItem('access_token');
        onClose();
        Navigate('/login');
        return;
      }

      if (response.status === 401) {
        alert("Sesión expirada. Inicia sesión nuevamente.");
        localStorage.removeItem("access_token");
        navigate("/login");
        return;
      }


      const data = await response.json();

      if (response.ok) {
        alert('¡Comprobante enviado con éxito! Espere la acreditación de los fondos.');
        onClose();
        setAmount('');
        setFile(null);
      } else {
        alert(data.message || 'Error al enviar el comprobante');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="payment-modal-header">
          <h2 className="payment-modal-title">
            <CreditCard className="modal-icon" />
            Recargar saldo
          </h2>
          <button onClick={onClose} className="close-button">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="payment-form">
          {/* Реквизиты */}
          <div className="payment-details-payment">
            <p className="details-label-payment">Datos para la transferencia:</p>

            {/* Card Photo */}
            {cardPhoto && (
              <div className="card-photo-section">
                <img 
                  src={cardPhoto}
                  alt="Bank Card"
                  className="card-photo"
                />
              </div>
            )}

            {/* Bank Name */}
            <div className="bank-card-item bank-header">
              <Building2 size={20} className="bank-icon" />
              <div className="bank-card-content">
                <span className="bank-card-value highlight">
                  {cardLoading ? 'Cargando...' : bankName}
                </span>
              </div>
            </div>

            {/* Account Type */}
            <div className="bank-card-item">
              <FileText size={18} className="detail-icon" />
              <div className="bank-card-content">
                <span className="bank-card-label">Tipo de cuenta:</span>
                <span className="bank-card-value">
                  {cardLoading ? 'Cargando...' : accountType}
                </span>
              </div>
            </div>

            {/* Account Number */}
            <div className="bank-card-item highlight-item">
              <Hash size={18} className="detail-icon" />
              <div className="bank-card-content">
                <span className="bank-card-label">Número:</span>
                <span className="bank-card-value mono">
                  {cardLoading ? 'Cargando...' : accountNumber}
                </span>
              </div>
            </div>

            {/* Card Holder Name */}
            <div className="bank-card-item">
              <User size={18} className="detail-icon" />
              <div className="bank-card-content">
                <span className="bank-card-label">Nombre:</span>
                <span className="bank-card-value">
                  {cardLoading ? 'Cargando...' : cardHolderName}
                </span>
              </div>
            </div>

            {/* Holder ID (CI) */}
            {holderId && (
              <div className="bank-card-item">
                <CreditCard size={18} className="detail-icon" />
                <div className="bank-card-content">
                  <span className="bank-card-label">CI:</span>
                  <span className="bank-card-value mono">
                    {cardLoading ? 'Cargando...' : holderId}
                  </span>
                </div>
              </div>
            )}

            {/* Phone Number (optional) */}
            {phoneNumber && (
              <div className="bank-card-item">
                <Phone size={18} className="detail-icon" />
                <div className="bank-card-content">
                  <span className="bank-card-label">Teléfono:</span>
                  <span className="bank-card-value">
                    {cardLoading ? 'Cargando...' : phoneNumber}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Выбор суммы */}
          <div className="amount-section">
            <label className="section-label">Ingrese el monto de recarga:</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Desde 50 USD"
              className="amount-input2"
              min="50"
              step="any"
              required
              disabled={loading}
            />
            <div className="min-amount-hint">
              💰 Monto mínimo: <strong>50 USD</strong>
            </div>
            
            {/* Валидация суммы */}
            {amount && Number(amount) < 50  && (
              <div className="error-message">
                ❌ El monto debe ser al menos 50 USD
              </div>
            )}
          </div>

          {/* Загрузка файла */}
          <div className="file-section">
            <p className="file-warning-payment">
              ⚠️ Después de realizar la transferencia, asegúrate de enviar el comprobante (recibo)
            </p>
            <label className="file-upload">
              <Upload className="upload-icon-payment" />
              <span>{file ? file.name : "Adjunta el comprobante"}</span>
              <input 
                type="file" 
                onChange={(e) => setFile(e.target.files[0])}
                accept="image/*,.pdf"
                className="file-input"
                required
                disabled={loading}
              />
            </label>
          </div>

          {/* Кнопки */}
          <div className="payment-buttons">
            <button 
              type="submit" 
              className="submit-button-payment"
              disabled={loading || Number(amount) < 50}
            >
              {loading ? 'Enviando...' : 'He realizado el pago'}
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="cancel-button"
              disabled={loading}
            >
             Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}