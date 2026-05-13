import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Download, 
  Settings, 
  FileText, 
  Building2, 
  User, 
  Palette,
  Image as ImageIcon
} from 'lucide-react';

export default function App() {
  // Estado para la información general
  const [info, setInfo] = useState({
    type: 'COTIZACIÓN', // FACTURA o COTIZACIÓN
    logoUrl: '/logo5-removebg-preview.png', // Usando la imagen del emprendimiento del usuario
    brandColor: '#000000', // Color por defecto (Negro)
    
    // Datos de la empresa
    companyName: 'JNSIX',
    companyAddress: 'Salta, Argentina',
    companyPhone: '3875145165',
    companyEmail: 'jnserrudo@gmail.com',
    companyWebsite: '',
    
    // Datos del cliente
    clientName: 'Alberto Muñoz',
    clientAddress: 'Avenida Siempre Viva 742',
    clientEmail: 'a.munoz@ejemplo.com',
    clientPhone: '123456789',
    
    // Datos del documento
    documentNumber: 'COT-001',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString().split('T')[0],
    validity: '15 días',
    
    // Configuraciones financieras
    currency: '$',
    taxName: 'IVA',
    taxRate: 21.0,
    
    // Firma Digital
    signatureUrl: '',
    signatureMode: 'line_only', // 'none', 'line_only', 'image_only', 'image_and_line'
    
    // Notas
    notes: 'MÉTODOS DE PAGO:\n- Transferencia Bancaria\n- Banco virtual Prex\n- ALIAS: 42520383.PREX',
  });

  // Estado para los ítems/productos
  const [items, setItems] = useState([
    { id: 1, description: 'Horas de trabajo', quantity: 1, price: 10 },
  ]);

  // Estado para múltiples descuentos y recargos
  const [adjustments, setAdjustments] = useState([]);

  // Manejador de subida de logo
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInfo({ ...info, logoUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Manejador de subida de firma
  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInfo({ ...info, signatureUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Manejadores de cambios
  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    setInfo({ ...info, [name]: value });
  };

  const handleItemChange = (id, field, value) => {
    const newItems = items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setItems(newItems);
  };

  const addItem = () => {
    const newItem = {
      id: Date.now(),
      description: '',
      quantity: 1,
      price: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const addAdjustment = () => {
    const newAdjustment = {
      id: Date.now(),
      description: '',
      type: 'discount', // 'discount' o 'surcharge'
      rate: 0
    };
    setAdjustments([...adjustments, newAdjustment]);
  };

  const removeAdjustment = (id) => {
    setAdjustments(adjustments.filter(adj => adj.id !== id));
  };

  const handleAdjustmentChange = (id, field, value) => {
    const newAdjustments = adjustments.map(adj => {
      if (adj.id === id) {
        return { ...adj, [field]: value };
      }
      return adj;
    });
    setAdjustments(newAdjustments);
  };

  // Cálculos Base
  const subtotal = items.reduce((acc, item) => acc + (parseFloat(item.quantity) * parseFloat(item.price || 0)), 0);
  
  // Calcular montos de cada ajuste dinámico
  let totalDiscountAmount = 0;
  let totalSurchargeAmount = 0;
  
  const calculatedAdjustments = adjustments.map(adj => {
    const amount = subtotal * (parseFloat(adj.rate || 0) / 100);
    if (adj.type === 'discount') totalDiscountAmount += amount;
    if (adj.type === 'surcharge') totalSurchargeAmount += amount;
    return { ...adj, amount };
  });
  
  // El subtotal ajustado sobre el que se calculan los impuestos
  const adjustedSubtotal = subtotal - totalDiscountAmount + totalSurchargeAmount;
  
  // Calcular impuesto sobre el subtotal ajustado
  const taxAmount = adjustedSubtotal * (parseFloat(info.taxRate || 0) / 100);
  
  // Total final
  const total = adjustedSubtotal + taxAmount;

  // Formateador de moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS', // Puedes cambiar esto según tu país
      minimumFractionDigits: 2
    }).format(amount).replace('ARS', info.currency);
  };

  // Función para imprimir/generar PDF
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen print:min-h-0 bg-slate-100 font-sans flex flex-col md:flex-row print:bg-white print:block">
      
      {/* ESTILOS PARA IMPRESIÓN (PDF) */}
      <style>
        {`
          @media print {
            @page {
              margin: 0; /* Elimina márgenes por defecto del navegador y oculta header/footer automático */
              size: auto;
            }
            html, body, #root { 
              background: white; 
              min-height: auto !important;
              height: auto !important;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .no-print { display: none !important; }
            .print-only { display: block !important; }
            .preview-container { 
              box-shadow: none !important; 
              margin: 0 !important;
              max-width: 100% !important;
              width: 100% !important;
              min-height: 100vh !important; /* Estira el contenedor al alto exacto de la hoja para que la franja inferior quede al ras */
              height: auto !important;
              page-break-after: auto;
            }
          }
        `}
      </style>

      {/* --- PANEL DE EDICIÓN (Oculto al imprimir) --- */}
      <div className="w-full md:w-1/3 lg:w-2/5 xl:w-1/3 p-4 md:p-6 bg-white border-r border-slate-200 md:overflow-y-auto md:max-h-screen no-print shadow-lg z-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Settings className="text-slate-800" /> Creador
          </h1>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-900 transition-colors shadow-sm"
          >
            <Download size={18} /> PDF
          </button>
        </div>

        <div className="space-y-6">
          {/* SECCIÓN: Diseño y Marca */}
          <section className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Palette size={16} /> Marca y Diseño
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Color Principal</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    name="brandColor" 
                    value={info.brandColor} 
                    onChange={handleInfoChange}
                    className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                  />
                  <input 
                    type="text" 
                    name="brandColor" 
                    value={info.brandColor} 
                    onChange={handleInfoChange}
                    className="flex-1 p-2 border border-slate-300 rounded focus:ring-2 focus:ring-slate-800"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Logo (Imagen)</label>
                <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-100 transition">
                  <div className="flex flex-col items-center">
                    <ImageIcon className="text-slate-400 mb-2" size={24} />
                    <span className="text-sm text-slate-500">Haz clic para subir logo</span>
                  </div>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
                {info.logoUrl && (
                  <button onClick={() => setInfo({...info, logoUrl: ''})} className="text-xs text-red-500 mt-1 hover:underline">Quitar logo</button>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Firma / Sello Digital</label>
                <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-100 transition">
                  <div className="flex flex-col items-center">
                    <ImageIcon className="text-slate-400 mb-2" size={24} />
                    <span className="text-sm text-slate-500">Haz clic para subir firma</span>
                  </div>
                  <input type="file" accept="image/*" onChange={handleSignatureUpload} className="hidden" />
                </label>
                {info.signatureUrl && (
                  <button onClick={() => setInfo({...info, signatureUrl: ''})} className="text-xs text-red-500 mt-1 hover:underline">Quitar firma</button>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Documento</label>
                <select 
                  name="type" 
                  value={info.type} 
                  onChange={handleInfoChange}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-slate-800"
                >
                  <option value="COTIZACIÓN">Cotización</option>
                  <option value="FACTURA">Factura</option>
                  <option value="PRESUPUESTO">Presupuesto</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Modo de Firma / Sello</label>
                <select 
                  name="signatureMode" 
                  value={info.signatureMode} 
                  onChange={handleInfoChange}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-slate-800"
                >
                  <option value="line_only">Sólo Línea (Para firmar a mano)</option>
                  <option value="image_only">Sólo Imagen (Sello / Logo)</option>
                  <option value="image_and_line">Imagen + Línea</option>
                  <option value="none">Ocultar bloque de firma</option>
                </select>
              </div>
            </div>
          </section>

          {/* SECCIÓN: Detalles del Documento */}
          <section className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <FileText size={16} /> Detalles
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Número</label>
                <input type="text" name="documentNumber" value={info.documentNumber} onChange={handleInfoChange} className="w-full p-2 text-sm border rounded focus:ring-2 focus:ring-slate-800" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Moneda</label>
                <input type="text" name="currency" value={info.currency} onChange={handleInfoChange} className="w-full p-2 text-sm border rounded focus:ring-2 focus:ring-slate-800" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Fecha</label>
                <input type="date" name="date" value={info.date} onChange={handleInfoChange} className="w-full p-2 text-sm border rounded focus:ring-2 focus:ring-slate-800" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Vencimiento (Opcional)</label>
                <input type="date" name="dueDate" value={info.dueDate} onChange={handleInfoChange} className="w-full p-2 text-sm border rounded focus:ring-2 focus:ring-slate-800" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-slate-500 mb-1">Validez</label>
                <input type="text" name="validity" value={info.validity} onChange={handleInfoChange} placeholder="Ej. 15 días" className="w-full p-2 text-sm border rounded focus:ring-2 focus:ring-slate-800" />
              </div>
            </div>
          </section>

          {/* SECCIÓN: Tu Empresa */}
          <section className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Building2 size={16} /> Tu Empresa
            </h2>
            <div className="space-y-3">
              <input type="text" name="companyName" value={info.companyName} onChange={handleInfoChange} placeholder="Nombre de la empresa" className="w-full p-2 text-sm border rounded font-bold focus:ring-2 focus:ring-slate-800" />
              <input type="text" name="companyAddress" value={info.companyAddress} onChange={handleInfoChange} placeholder="Dirección" className="w-full p-2 text-sm border rounded focus:ring-2 focus:ring-slate-800" />
              <div className="grid grid-cols-2 gap-2">
                <input type="text" name="companyPhone" value={info.companyPhone} onChange={handleInfoChange} placeholder="Teléfono" className="w-full p-2 text-sm border rounded focus:ring-2 focus:ring-slate-800" />
                <input type="text" name="companyEmail" value={info.companyEmail} onChange={handleInfoChange} placeholder="Email" className="w-full p-2 text-sm border rounded focus:ring-2 focus:ring-slate-800" />
              </div>
              <input type="text" name="companyWebsite" value={info.companyWebsite} onChange={handleInfoChange} placeholder="Sitio Web" className="w-full p-2 text-sm border rounded focus:ring-2 focus:ring-slate-800" />
            </div>
          </section>

          {/* SECCIÓN: Cliente */}
          <section className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <User size={16} /> Cliente
            </h2>
            <div className="space-y-3">
              <input type="text" name="clientName" value={info.clientName} onChange={handleInfoChange} placeholder="Nombre del cliente" className="w-full p-2 text-sm border rounded font-bold focus:ring-2 focus:ring-slate-800" />
              <input type="text" name="clientAddress" value={info.clientAddress} onChange={handleInfoChange} placeholder="Dirección del cliente" className="w-full p-2 text-sm border rounded focus:ring-2 focus:ring-slate-800" />
              <div className="grid grid-cols-2 gap-2">
                <input type="text" name="clientPhone" value={info.clientPhone} onChange={handleInfoChange} placeholder="Teléfono" className="w-full p-2 text-sm border rounded focus:ring-2 focus:ring-slate-800" />
                <input type="text" name="clientEmail" value={info.clientEmail} onChange={handleInfoChange} placeholder="Email" className="w-full p-2 text-sm border rounded focus:ring-2 focus:ring-slate-800" />
              </div>
            </div>
          </section>

          {/* SECCIÓN: Productos / Servicios */}
          <section className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <FileText size={16} /> Ítems
              </h2>
            </div>
            
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={item.id} className="bg-white p-3 rounded border border-slate-200 relative group">
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Eliminar"
                  >
                    <Trash2 size={14} />
                  </button>
                  <input 
                    type="text" 
                    value={item.description} 
                    onChange={(e) => handleItemChange(item.id, 'description', e.target.value)} 
                    placeholder="Descripción del servicio/producto" 
                    className="w-full p-2 text-sm border-b focus:outline-none focus:border-slate-800 mb-2 font-medium" 
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase">Cantidad</label>
                      <input 
                        type="number" 
                        value={item.quantity} 
                        onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)} 
                        className="w-full p-2 text-sm border rounded bg-slate-50 focus:ring-2 focus:ring-slate-800" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase">Precio Unit. ({info.currency})</label>
                      <input 
                        type="number" 
                        value={item.price} 
                        onChange={(e) => handleItemChange(item.id, 'price', e.target.value)} 
                        className="w-full p-2 text-sm border rounded bg-slate-50 focus:ring-2 focus:ring-slate-800" 
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button 
                onClick={addItem}
                className="w-full py-2 border-2 border-dashed border-slate-300 text-slate-500 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Plus size={16} /> Agregar ítem
              </button>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Nombre Impuesto</label>
                <input type="text" name="taxName" value={info.taxName} onChange={handleInfoChange} className="w-full p-2 text-sm border rounded focus:ring-2 focus:ring-slate-800" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">% Impuesto</label>
                <input type="number" name="taxRate" value={info.taxRate} onChange={handleInfoChange} className="w-full p-2 text-sm border rounded focus:ring-2 focus:ring-slate-800" />
              </div>
            </div>
          </section>

          {/* SECCIÓN: Descuentos y Recargos */}
          <section className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Plus size={16} /> Descuentos y Recargos
              </h2>
            </div>
            
            <div className="space-y-3">
              {adjustments.map((adj) => (
                <div key={adj.id} className="bg-white p-3 rounded border border-slate-200 relative group">
                  <button 
                    onClick={() => removeAdjustment(adj.id)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Eliminar"
                  >
                    <Trash2 size={14} />
                  </button>
                  <input 
                    type="text" 
                    value={adj.description} 
                    onChange={(e) => handleAdjustmentChange(adj.id, 'description', e.target.value)} 
                    placeholder="Descripción (Ej. Cliente frecuente)" 
                    className="w-full p-2 text-sm border-b focus:outline-none focus:border-slate-800 mb-2 font-medium" 
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase">Tipo</label>
                      <select 
                        value={adj.type} 
                        onChange={(e) => handleAdjustmentChange(adj.id, 'type', e.target.value)} 
                        className="w-full p-2 text-sm border rounded bg-slate-50 focus:ring-2 focus:ring-slate-800"
                      >
                        <option value="discount">Descuento</option>
                        <option value="surcharge">Recargo</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase">Porcentaje (%)</label>
                      <input 
                        type="number" 
                        value={adj.rate} 
                        onChange={(e) => handleAdjustmentChange(adj.id, 'rate', e.target.value)} 
                        className="w-full p-2 text-sm border rounded bg-slate-50 focus:ring-2 focus:ring-slate-800" 
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button 
                onClick={addAdjustment}
                className="w-full py-2 border-2 border-dashed border-slate-300 text-slate-500 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Plus size={16} /> Agregar ajuste
              </button>
            </div>
          </section>

          {/* SECCIÓN: Notas Adicionales */}
          <section className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Notas / Condiciones</h2>
            <textarea 
              name="notes" 
              value={info.notes} 
              onChange={handleInfoChange} 
              rows="4" 
              className="w-full p-2 text-sm border rounded focus:ring-2 focus:ring-slate-800"
            />
          </section>

        </div>
      </div>

      {/* --- PANEL DE VISTA PREVIA (El Documento Real) --- */}
      <div className="w-full md:w-2/3 lg:w-3/5 xl:w-2/3 p-4 md:p-8 flex justify-center items-start md:overflow-y-auto md:max-h-screen bg-slate-200 print:p-0 print:overflow-visible print:max-h-none print:bg-white print:block">
        
        {/* Contenedor principal del documento */}
        <div className="preview-container bg-white w-full max-w-[21cm] min-h-[29.7cm] p-6 sm:p-10 md:p-14 shadow-2xl relative" id="invoice-preview">
          
          {/* Faja de adorno superior usando el color de marca */}
          <div className="absolute top-0 left-0 w-full h-3" style={{ backgroundColor: info.brandColor }}></div>

          {/* ENCABEZADO: Logo y Datos de Empresa */}
          <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-end mb-12 mt-4 gap-6 sm:gap-0">
            <div className="w-full sm:max-w-[50%]">
              {info.logoUrl ? (
                <img src={info.logoUrl} alt="Logo" className="max-h-24 object-contain mb-4 sm:mb-0" />
              ) : (
                <div 
                  className="text-4xl font-black tracking-tighter mb-4 sm:mb-0" 
                  style={{ color: info.brandColor }}
                >
                  {info.companyName}
                </div>
              )}
            </div>
            
            <div className="text-left sm:text-right w-full sm:max-w-[45%] text-slate-600 text-sm">
              <h2 className="font-bold text-lg text-slate-800 mb-1">{info.companyName}</h2>
              <p>{info.companyAddress}</p>
              <p>{info.companyPhone}</p>
              <p>{info.companyEmail}</p>
              <p>{info.companyWebsite}</p>
            </div>
          </div>

          <div className="border-t border-b border-slate-200 py-6 mb-8 flex flex-col sm:flex-row justify-between gap-6 sm:gap-0">
            {/* DATOS DEL CLIENTE */}
            <div className="w-full sm:w-1/2 sm:pr-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2" style={{ color: info.brandColor }}>Preparado Para</h3>
              <p className="font-bold text-slate-800 text-lg mb-1">{info.clientName}</p>
              <p className="text-slate-600 text-sm leading-relaxed">{info.clientAddress}</p>
              <p className="text-slate-600 text-sm leading-relaxed">{info.clientPhone}</p>
              <p className="text-slate-600 text-sm leading-relaxed">{info.clientEmail}</p>
            </div>

            {/* DATOS DEL DOCUMENTO */}
            <div className="w-full sm:w-1/2 sm:pl-4 flex flex-col items-start sm:items-end text-left sm:text-right">
              <h1 className="text-3xl font-light text-slate-400 tracking-widest uppercase mb-4">
                {info.type}
              </h1>
              <table className="text-sm text-left sm:text-right">
                <tbody>
                  <tr>
                    <td className="pr-4 py-1 font-semibold text-slate-500">NÚMERO:</td>
                    <td className="py-1 text-slate-800 font-medium">{info.documentNumber}</td>
                  </tr>
                  <tr>
                    <td className="pr-4 py-1 font-semibold text-slate-500">FECHA:</td>
                    <td className="py-1 text-slate-800">{info.date ? new Date(info.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric'}) : '—'}</td>
                  </tr>
                  {info.dueDate && (
                    <tr>
                      <td className="pr-4 py-1 font-semibold text-slate-500">VENCIMIENTO:</td>
                      <td className="py-1 text-slate-800">{new Date(info.dueDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric'})}</td>
                    </tr>
                  )}
                  {info.validity && (
                    <tr>
                      <td className="pr-4 py-1 font-semibold text-slate-500">VALIDEZ:</td>
                      <td className="py-1 text-slate-800">{info.validity}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* TABLA DE PRODUCTOS / SERVICIOS */}
          <div className="w-full mb-8 overflow-x-auto">
            <table className="w-full min-w-[500px] text-sm">
            <thead>
              <tr className="text-white uppercase text-xs" style={{ backgroundColor: info.brandColor }}>
                <th className="py-3 px-4 text-left font-semibold rounded-tl-md">Descripción</th>
                <th className="py-3 px-4 text-center font-semibold">Cantidad</th>
                <th className="py-3 px-4 text-right font-semibold">Precio Unit.</th>
                <th className="py-3 px-4 text-right font-semibold rounded-tr-md">Importe</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} className={`border-b border-slate-100 ${index % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'}`}>
                  <td className="py-4 px-4 text-slate-800">{item.description || '—'}</td>
                  <td className="py-4 px-4 text-center text-slate-600">{item.quantity}</td>
                  <td className="py-4 px-4 text-right text-slate-600">{formatCurrency(item.price)}</td>
                  <td className="py-4 px-4 text-right text-slate-800 font-medium">
                    {formatCurrency(item.quantity * item.price)}
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>

          {/* RESUMEN DE TOTALES */}
          <div className="flex justify-end mb-12">
            <div className="w-full max-w-sm">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="py-2 text-slate-500 font-semibold text-right pr-6">SUBTOTAL:</td>
                    <td className="py-2 text-right text-slate-800 font-medium">{formatCurrency(subtotal)}</td>
                  </tr>
                  
                  {/* Descuentos y Recargos Dinámicos */}
                  {calculatedAdjustments.map((adj) => {
                    if (parseFloat(adj.rate) <= 0) return null;
                    
                    if (adj.type === 'discount') {
                      return (
                        <tr key={adj.id} className="border-b border-slate-200">
                          <td className="py-2 text-emerald-600 font-semibold text-right pr-6">
                            {adj.description || 'Descuento'} ({adj.rate}%):
                          </td>
                          <td className="py-2 text-right text-emerald-700 font-medium">-{formatCurrency(adj.amount)}</td>
                        </tr>
                      );
                    } else {
                      return (
                        <tr key={adj.id} className="border-b border-slate-200">
                          <td className="py-2 text-amber-600 font-semibold text-right pr-6">
                            {adj.description || 'Recargo'} ({adj.rate}%):
                          </td>
                          <td className="py-2 text-right text-amber-700 font-medium">+{formatCurrency(adj.amount)}</td>
                        </tr>
                      );
                    }
                  })}

                  {parseFloat(info.taxRate) > 0 && (
                    <tr className="border-b border-slate-200">
                      <td className="py-2 text-slate-500 font-semibold text-right pr-6">{info.taxName} ({info.taxRate}%):</td>
                      <td className="py-2 text-right text-slate-800 font-medium">{formatCurrency(taxAmount)}</td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan="2" className="pt-4">
                      <div className="flex justify-between items-center rounded-lg px-6 py-4 text-white" style={{ backgroundColor: info.brandColor }}>
                        <span className="font-bold uppercase tracking-wider text-sm">Total Por Pagar</span>
                        <span className="font-bold text-xl">{formatCurrency(total)}</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* PIE DE PÁGINA: Notas y Firmas */}
          <div className="mt-16 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-12 sm:gap-0">
            <div className="w-full sm:w-2/3 sm:pr-8">
              {info.notes && (
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase mb-2">Información Adicional</h4>
                  <p className="text-slate-600 text-sm whitespace-pre-line leading-relaxed">
                    {info.notes}
                  </p>
                </div>
              )}
            </div>
            
            <div className="w-full sm:w-1/3 flex flex-col items-center justify-end min-h-[100px]">
              {info.signatureMode !== 'none' && (
                <>
                  {(info.signatureMode === 'image_only' || info.signatureMode === 'image_and_line') && info.signatureUrl && (
                    <img src={info.signatureUrl} alt="Firma o Sello" className="max-h-40 object-contain mb-2" />
                  )}
                  
                  {(info.signatureMode === 'line_only' || info.signatureMode === 'image_and_line') && (
                    <>
                      <div className="border-t-2 border-slate-300 w-full mb-2 mt-auto"></div>
                      <p className="text-slate-500 text-xs uppercase tracking-wider">Firma Autorizada</p>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Adorno inferior */}
          <div className="absolute bottom-0 left-0 w-full h-1" style={{ backgroundColor: info.brandColor }}></div>
          
        </div>
      </div>
    </div>
  );
}
