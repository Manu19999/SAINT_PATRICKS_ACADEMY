// Path: src/views/pages/solicitud/Solicitud.js
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { AuthContext } from '/context/AuthProvider'; // Asegúrate de que la ruta sea correcta
import { cilPen, cilPlus, cilSave, cilFile, cilSearch, cilWarning, cilCheckCircle, cilXCircle } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import {
  CButton,
  CContainer,
  CRow,
  CCol,
  CSpinner,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CCard,
  CCardBody,
  CCardHeader,
  CAlert,
  CBadge,
  CForm,
  CFormInput,
  CFormLabel,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CInputGroup,
  CInputGroupText,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
} from '@coreui/react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import logo from 'src/assets/brand/logo_saint_patrick.png';
import usePermission from '../../../../context/usePermission';
import AccessDenied from "../AccessDenied/AccessDenied"


// Función para decodificar JWT
const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error al decodificar el token JWT:', error);
    return null;
  }
};

const Solicitud = () => {
  const { canSelect, canDelete, canInsert, canUpdate } = usePermission('Solicitudes_Padre');
  const { auth } = useContext(AuthContext); // Obtener el usuario autenticado desde AuthContext
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCita, setSelectedCita] = useState(null);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [allCitasModalVisible, setAllCitasModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCitas, setFilteredCitas] = useState([]);
  const [formValues, setFormValues] = useState({
    title: '',
    description: '',
    personaRequerida: '',
    fecha: '',
    horaInicio: '',
    horaFin: '',
    cod_persona: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSolicitudes();
  }, []);
  const fetchSolicitudes = async () => {
    setLoading(true);
    setError('');
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Usuario no autenticado. Por favor, inicia sesión.');
        }

        const response = await fetch('http://localhost:4000/api/solicitud/solicitudes', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Error al obtener las solicitudes.');
        }

        const data = await response.json();

        const solicitudesData = data.map((solicitud) => ({
            id: solicitud.Cod_solicitud || '',
            title: solicitud.Nombre_solicitud || 'SIN TÍTULO',
            start: solicitud.Fecha_solicitud || '',
            description: solicitud.Asunto || 'SIN ASUNTO',
            personaRequerida: solicitud.Persona_requerida || 'DESCONOCIDO',
            horaInicio: solicitud.Hora_Inicio || '00:00', // Siempre en formato HH:mm
            horaFin: solicitud.Hora_Fin || '00:00', // Siempre en formato HH:mm
            estado: solicitud.Estado || 'Pendiente',
        }));

        setSolicitudes(solicitudesData);
        setFilteredCitas(solicitudesData);
    } catch (error) {
        console.error('Error al obtener las solicitudes:', error.message);
        setError(error.message);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message,
            confirmButtonColor: '#6C8E58',
        });
    } finally {
        setLoading(false);
    }
};

  
  
  
  const decodeJWT = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error al decodificar el token JWT:', error);
      return null;
    }
  };
    

  const getColorByEstado = (estado) => {
    switch (estado) {
      case 'Pendiente':
        return 'rgba(255, 215, 0, 0.7)';
      case 'Finalizada':
        return 'rgba(0, 128, 0, 0.7)';
      case 'Cancelada':
        return 'rgba(255, 0, 0, 0.7)';
      default:
        return 'rgba(75, 98, 81, 0.7)';
    }
  };

  const getIconByEstado = (estado) => {
    switch (estado) {
      case 'Pendiente':
        return cilWarning;
      case 'Finalizada':
        return cilCheckCircle;
      case 'Cancelada':
        return cilXCircle;
      default:
        return cilWarning;
    }
  };

  const exportarCitaAPDF = (cita) => {
    const doc = new jsPDF();
    const img = new Image();
    img.src = logo;

    img.onload = () => {
      doc.addImage(img, 'PNG', 10, 10, 30, 30);
      doc.setFontSize(18);
      doc.setTextColor(0, 102, 51);
      doc.text("SAINT PATRICK'S ACADEMY", doc.internal.pageSize.width / 2, 20, { align: 'center' });
      doc.setFontSize(14);
      doc.text('Detalles de la Cita', doc.internal.pageSize.width / 2, 30, { align: 'center' });
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('Casa Club del periodista, Colonia del Periodista', doc.internal.pageSize.width / 2, 40, { align: 'center' });
      doc.text('Teléfono: (504) 2234-8871', doc.internal.pageSize.width / 2, 45, { align: 'center' });
      doc.text('Correo: info@saintpatrickacademy.edu', doc.internal.pageSize.width / 2, 50, { align: 'center' });
      doc.setLineWidth(0.5);
      doc.setDrawColor(0, 102, 51);
      doc.line(10, 55, doc.internal.pageSize.width - 10, 55);

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Título: ${cita.title}`, 20, 70);
      doc.text(`Asunto: ${cita.description}`, 20, 80);
      doc.text(`Persona Requerida: ${cita.personaRequerida}`, 20, 90);
      doc.text(`Fecha: ${cita.start}`, 20, 100);
      doc.text(`Hora de Inicio: ${cita.horaInicio}`, 20, 110);
      doc.text(`Hora de Fin: ${cita.horaFin}`, 20, 120);
      doc.text(`Estado: ${cita.estado}`, 20, 130);

      const date = new Date().toLocaleDateString();
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Fecha de generación: ${date}`, 10, doc.internal.pageSize.height - 10);
      doc.save(`Detalles_Cita_${cita.title}.pdf`);
    };

    img.onerror = () => {
      console.warn('No se pudo cargar el logo. El PDF se generará sin el logo.');
    };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = solicitudes.filter((cita) =>
      cita.title.toLowerCase().includes(value) || cita.start.includes(value)
    );
    setFilteredCitas(filtered);
  };

  const limpiarBusqueda = () => {
    setSearchTerm('');
    setFilteredCitas(solicitudes);
  };

  const handleEventClick = (info) => {
    const citaSeleccionada = solicitudes.find((cita) => cita.id === parseInt(info.event.id, 10));
    if (citaSeleccionada) {
      setSelectedCita(citaSeleccionada);
      setModalVisible(true);
    }
  };

  const handleEventDrop = async (info) => {
    const citaId = parseInt(info.event.id, 10); // Event ID from FullCalendar
    const newDate = new Date(info.event.startStr).toISOString().split('T')[0]; // Format new date as YYYY-MM-DD
    const cita = solicitudes.find((c) => c.id === citaId); // Find the corresponding event in state

    if (!cita) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se encontró la cita para actualizar.',
            confirmButtonColor: '#6C8E58',
        });
        return info.revert(); // Revert the event if no match is found
    }

    Swal.fire({
        title: 'Confirmación',
        text: `¿Deseas cambiar la fecha de esta cita a ${newDate}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, cambiar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#4B6251',
        cancelButtonColor: '#6C8E58',
    }).then(async (result) => {
        if (!result.isConfirmed) {
            info.revert(); // Revert the drag action if the user cancels
            return;
        }

        try {
            // Prepare the payload for the PUT request
            const requestData = {
                Cod_persona: cita.cod_persona, // Ensure Cod_persona is included
                Nombre_solicitud: cita.title || 'SIN TÍTULO', // Use default title if missing
                Fecha_solicitud: newDate, // Update with the new date
                Hora_Inicio: cita.horaInicio || '00:00', // Ensure Hora_Inicio is sent
                Hora_Fin: cita.horaFin || null, // Optional Hora_Fin, send null if not present
                Asunto: cita.description || 'SIN ASUNTO', // Default if Asunto is missing
                Persona_requerida: cita.personaRequerida || 'DESCONOCIDO', // Default if missing
            };

            console.log('Sending PUT request with data:', requestData);

            const response = await fetch(`http://localhost:4000/api/Solicitud_admin/solicitudes/${citaId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData), // Send the request payload
            });

            const responseData = await response.json();
            console.log('Response from server:', responseData);

            if (!response.ok) {
                throw new Error(responseData.message || 'Error al actualizar la cita.');
            }

            Swal.fire({
                icon: 'success',
                title: 'Actualizado',
                text: 'La fecha de la cita se actualizó con éxito.',
                confirmButtonColor: '#4B6251',
            });

            await fetchSolicitudes(); // Refresh the list of events after successful update
        } catch (error) {
            console.error('Error during update:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `No se pudo actualizar la fecha. ${error.message}`,
                confirmButtonColor: '#6C8E58',
            });
            info.revert(); // Revert the event position if the update fails
        }
    });
};



  const handleDateSelect = (selectInfo) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      fecha: selectInfo.startStr,
    }));
    setFormModalVisible(true);
  };

  const handleNuevaCita = () => {
    setFormValues({
      title: '',
      description: '',
      personaRequerida: '',
      fecha: '',
      horaInicio: '',
      horaFin: '',
      Cod_persona: '',
    });
    setSelectedCita(null);
    setFormModalVisible(true);
  };

  const handleEditarCita = () => {
    if (selectedCita) {
      setFormValues({
        title: selectedCita.title,
        description: selectedCita.description,
        personaRequerida: selectedCita.personaRequerida,
        fecha: selectedCita.start,
        horaInicio: selectedCita.horaInicio,
        horaFin: selectedCita.horaFin,
        estado: selectedCita.estado,
      });
      setModalVisible(false);
      setFormModalVisible(true);
    }
  };

  const areFieldsValid = () => {
    const { title, description, personaRequerida, fecha, horaInicio, horaFin } = formValues;
    if (!title || !description || !personaRequerida || !fecha || !horaInicio || !horaFin) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Todos los campos son obligatorios.',
        confirmButtonColor: '#6C8E58',
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validar los campos obligatorios
    const { title, description, personaRequerida, fecha, horaInicio, horaFin } = formValues;
    if (!title || !description || !personaRequerida || !fecha || !horaInicio) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Todos los campos son obligatorios, excepto Hora_Fin.',
        confirmButtonColor: '#6C8E58',
      });
      return;
    }
  
    // Validar coherencia de horas
    const [horaInicioHoras, horaInicioMinutos] = horaInicio.split(':').map(Number);
    if (horaFin) {
      const [horaFinHoras, horaFinMinutos] = horaFin.split(':').map(Number);
      if (
        horaFinHoras < horaInicioHoras ||
        (horaFinHoras === horaInicioHoras && horaFinMinutos <= horaInicioMinutos)
      ) {
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          text: 'La hora de fin debe ser mayor que la hora de inicio.',
          confirmButtonColor: '#6C8E58',
        });
        return;
      }
    }
  
    setIsSubmitting(true);
  
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Usuario no autenticado. Por favor, inicia sesión.');
      }
  
      // Construir datos de solicitud
      const requestData = {
        Nombre_solicitud: title || 'SIN TÍTULO',
        Fecha_solicitud: fecha,
        Hora_Inicio: horaInicio,
        Hora_Fin: horaFin ,
        Asunto: description || 'SIN ASUNTO',
        Persona_requerida: personaRequerida || 'DESCONOCIDO',
        Cod_persona: auth.cod_persona,
      };
  
      const response = await fetch(
        selectedCita
          ? `http://localhost:4000/api/solicitud/solicitudes/${selectedCita.id}`
          : 'http://localhost:4000/api/solicitud/solicitudes',
        {
          method: selectedCita ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestData),
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al procesar la solicitud.');
      }
  
      Swal.fire({
        icon: 'success',
        title: selectedCita ? 'Actualizado' : 'Creado',
        text: selectedCita
          ? 'La cita fue actualizada correctamente.'
          : 'La cita fue creada correctamente.',
        confirmButtonColor: '#4B6251',
      });
  
      setFormModalVisible(false);
      await fetchSolicitudes();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message,
        confirmButtonColor: '#6C8E58',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  



  const handleVerTodasCitas = () => {
    setAllCitasModalVisible(true);
  };

  const handleModalClose = () => {
    if (isSubmitting) return;
    setFormModalVisible(false);
    setAllCitasModalVisible(false);
  };

  const exportarAPDF = () => {
    const doc = new jsPDF('landscape'); // Set orientation to landscape
  
    if (solicitudes.length === 0) {
        console.warn('No hay datos de citas para exportar.');
        return;
    }
  
    const img = new Image();
    img.src = logo;
  
    img.onload = () => {
        // Header with logo and institution details
        doc.addImage(img, 'PNG', 10, 10, 30, 30);
        doc.setFontSize(18);
        doc.setTextColor(0, 102, 51);
        doc.text("SAINT PATRICK'S ACADEMY", doc.internal.pageSize.width / 2, 20, { align: 'center' });
        doc.setFontSize(14);
        doc.text('Reporte Detallado de Citas', doc.internal.pageSize.width / 2, 30, { align: 'center' });
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text('Casa Club del periodista, Colonia del Periodista', doc.internal.pageSize.width / 2, 40, { align: 'center' });
        doc.text('Teléfono: (504) 2234-8871', doc.internal.pageSize.width / 2, 45, { align: 'center' });
        doc.text('Correo: info@saintpatrickacademy.edu', doc.internal.pageSize.width / 2, 50, { align: 'center' });
        doc.setLineWidth(0.5);
        doc.setDrawColor(0, 102, 51);
        doc.line(10, 55, doc.internal.pageSize.width - 10, 55);
  
        // Generate table with the required fields
        doc.autoTable({
            startY: 60,
            head: [
                [
                    'Título',
                    'Asunto',
                    'Persona Requerida',
                    'Fecha',
                    'Hora Inicio',
                    'Hora Fin',
                    'Estado',
                ],
            ],
            body: solicitudes.map((cita) => [
                cita.title || 'Título no disponible',
                cita.description || 'Sin descripción',
                cita.personaRequerida || 'No especificada',
                cita.start || 'Fecha no disponible',
                cita.horaInicio || 'Hora no disponible',
                cita.horaFin || 'Hora no disponible',
                cita.estado || 'Estado no disponible',
            ]),
            headStyles: {
                fillColor: [0, 102, 51],
                textColor: [255, 255, 255],
                fontSize: 10,
            },
            styles: {
                fontSize: 10,
                cellPadding: 3,
            },
            alternateRowStyles: { fillColor: [240, 248, 255] },
        });
  
        // Footer with generation date
        const date = new Date().toLocaleDateString();
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Fecha de generación: ${date}`, 10, doc.internal.pageSize.height - 10);
  
        // Open the PDF in a new tab
        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, '_blank');
    };
  
    img.onerror = () => {
        console.warn('No se pudo cargar el logo. El PDF se generará sin el logo.');
    };
};


  const exportarAExcel = () => {
    const hoja = XLSX.utils.json_to_sheet(
      solicitudes.map((cita, index) => ({
        '#': index + 1,
        'Título': cita.title.toUpperCase(),
        'Asunto': cita.description.toUpperCase(),
        'Persona Requerida': cita.personaRequerida.toUpperCase(),
        'Fecha': cita.start,
        'Hora Inicio': cita.horaInicio,
        'Hora Fin': cita.horaFin,
        'Estado': cita.estado,
      }))
    );
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Reporte de Citas');
    XLSX.writeFile(libro, 'Reporte_Citas.xlsx');
  };



  //AQUI VA LA LOGICA PARA QUE SALGA LA PANTALLA DE ACCESO DENEGADO
  // Verificar permisos
  if (!canSelect) {
    return <AccessDenied />;
  }
  


  return (
    <CContainer fluid style={{ backgroundColor: '#F8F9FA', padding: '20px' }}>
      <CRow className="mb-4">
        <CCol className="text-center">
          <h1 style={{ color: '#6C757D', fontWeight: 'bold', fontSize: '2.5rem' }}>Gestión de Citas</h1>
        </CCol>
      </CRow>

      <CRow className="mb-3 align-items-center">
        <CCol md={6}>
          <CInputGroup>
            <CInputGroupText style={{ backgroundColor: '#4B6251', color: 'white' }}>
              <CIcon icon={cilSearch} />
            </CInputGroupText>
            <CFormInput
              placeholder="Buscar por título o fecha"
              value={searchTerm}
              onChange={handleSearch}
              style={{ borderColor: '#4B6251' }}
            />
            <CButton
              color="secondary"
              onClick={limpiarBusqueda}
              style={{ backgroundColor: '#6C8E58', color: 'white', borderColor: '#6C8E58' }}
            >
              Limpiar
            </CButton>
          </CInputGroup>
        </CCol>
        <CCol md={3}>
          <span style={{ color: '#6C757D' }}>{`Citas encontradas: ${filteredCitas.length}`}</span>
        </CCol>
        <CCol md={3} className="text-end">

        {canInsert &&  (
          <CButton
            color="success"
            onClick={handleNuevaCita}
            style={{ backgroundColor: '#4B6251', color: 'white', borderColor: '#4B6251' }}
          >
            <CIcon icon={cilPlus} /> Nueva Cita
          </CButton>
        )}


          <CDropdown className="d-inline ms-2">
            <CDropdownToggle style={{ backgroundColor: '#6C8E58', color: 'white' }}>
              <CIcon icon={cilFile} /> Reporte
            </CDropdownToggle>
            <CDropdownMenu>
              <CDropdownItem onClick={exportarAPDF}>Exportar a PDF</CDropdownItem>
              <CDropdownItem onClick={exportarAExcel}>Exportar a Excel</CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
        </CCol>
      </CRow>

      {loading ? (
        <CSpinner color="secondary" />
      ) : error ? (
        <CAlert color="danger">{error}</CAlert>
      ) : (
        <div
          className="calendar-container"
          style={{
            maxWidth: '1500px',
            margin: '0 auto',
            boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
            borderRadius: '8px',
            backgroundColor: '#FFFFFF',
            padding: '15px',
          }}
        >
          <FullCalendar
  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
  initialView="dayGridMonth"
  locale={esLocale}
  headerToolbar={{
    left: 'prev today next',
    center: 'title',
    right: 'dayGridMonth,timeGridDay',
  }}
  events={filteredCitas.map((cita) => ({
    ...cita,
    id: cita.id.toString(),
    backgroundColor: getColorByEstado(cita.estado),
    borderColor: '#4B6251',
    textColor: '#000000',
    extendedProps: { 
      horaInicio: cita.horaInicio, 
      horaFin: cita.horaFin,
      icon: getIconByEstado(cita.estado)
    },
  }))}
  eventContent={(eventInfo) => {
    // Evaluar la vista activa
    if (eventInfo.view.type === 'timeGridDay') {
      // Mostrar título con hora de inicio y fin en la vista diaria
      return (
        <span>
          <strong>{eventInfo.event.title}</strong>
          <br />
          {eventInfo.event.extendedProps.horaInicio} - {eventInfo.event.extendedProps.horaFin}
        </span>
      );
    }
    // Mostrar solo el título en otras vistas
    return <span>{eventInfo.event.title}</span>;
  }}
  eventClick={handleEventClick}
  dateClick={handleDateSelect}
  eventDrop={handleEventDrop}
  editable={true}
  height="auto"
  contentHeight="auto"
  titleFormat={{ year: 'numeric', month: 'long' }}
  dayHeaderClassNames="fc-day-header"
  dayHeaderContent={(args) => (
    <span style={{ color: '#4B6251', fontWeight: 'bold' }}>{args.text}</span>
  )}
/>
        </div>
      )}

      <CModal visible={modalVisible} onClose={() => setModalVisible(false)} backdrop="static">
        <CModalHeader closeButton style={{ backgroundColor: '#6C8E58', color: 'white' }}>
          <CModalTitle>Detalles de la Cita</CModalTitle>
        </CModalHeader>
        <CModalBody>
  {selectedCita && (
    <CCard>
      <CCardHeader>
        <strong>{selectedCita.title}</strong>
        {selectedCita.important && (
          <CBadge color="danger" className="ms-2">
            Importante
          </CBadge>
        )}
      </CCardHeader>
      <CCardBody>
        <p><strong>Asunto:</strong> {selectedCita.description}</p>
        <p><strong>Persona Requerida:</strong> {selectedCita.personaRequerida}</p>
        <p><strong>Fecha:</strong> {selectedCita.start}</p>
        <p><strong>Hora de Inicio:</strong> {selectedCita.horaInicio}</p>
        <p><strong>Hora de Fin:</strong> {selectedCita.horaFin} </p>
        <p><strong>Estado:</strong> {selectedCita.estado}</p>
        <CButton
          color="warning"
          onClick={handleEditarCita}
          style={{ backgroundColor: '#6C8E58', color: 'white' }}
        >
          <CIcon icon={cilPen} /> Editar
        </CButton>
        <CButton
          color="secondary"
          className="ms-2"
          onClick={() => exportarCitaAPDF(selectedCita)}
          style={{ backgroundColor: '#6C8E58', color: 'white', borderColor: '#6C8E58' }}
        >
          <CIcon icon={cilFile} /> Exportar PDF
        </CButton>
      </CCardBody>
    </CCard>
  )}
</CModalBody>

      </CModal>

      <CModal visible={formModalVisible} onClose={handleModalClose} backdrop="static">
  <CModalHeader closeButton style={{ backgroundColor: '#4B6251', color: 'white' }}>
    <CModalTitle>{selectedCita ? 'Editar Cita' : 'Crear Nueva Cita'}</CModalTitle>
  </CModalHeader>
  <CModalBody>
    <CForm onSubmit={handleSubmit}>
      <CCard className="p-3" style={{ border: '1px solid #4B6251' }}>
        <CRow className="mb-3">
          <CCol md={12}>
            <CFormLabel>Nombre de la Cita</CFormLabel>
            <CFormInput
              type="text"
              name="title"
              value={formValues.title}
              onChange={handleInputChange}
              placeholder="Ejemplo: Reunión de Proyecto"
              required
              style={{ borderColor: '#6C8E58' }}
            />
          </CCol>
        </CRow>
        <CRow className="mb-3">
          <CCol md={12}>
            <CFormLabel>Asunto</CFormLabel>
            <CFormInput
              type="text"
              name="description"
              value={formValues.description}
              onChange={handleInputChange}
              placeholder="Ejemplo: Discutir avances del proyecto"
              required
              style={{ borderColor: '#6C8E58' }}
            />
          </CCol>
        </CRow>
        <CRow className="mb-3">
          <CCol md={12}>
            <CFormLabel>Persona Requerida</CFormLabel>
            <CFormInput
              type="text"
              name="personaRequerida"
              value={formValues.personaRequerida}
              onChange={handleInputChange}
              placeholder="Ejemplo: Juan Pérez"
              required
              style={{ borderColor: '#6C8E58' }}
            />
          </CCol>
        </CRow>
        <CRow className="mb-3">
          <CCol md={4}>
            <CFormLabel>Fecha</CFormLabel>
            <CFormInput
              type="date"
              name="fecha"
              value={formValues.fecha}
              onChange={handleInputChange}
              required
              style={{ borderColor: '#6C8E58' }}
            />
          </CCol>
          <CCol md={4}>
            <CFormLabel>Hora de Inicio</CFormLabel>
            <CFormInput
              type="time"
              name="horaInicio"
              value={formValues.horaInicio}
              onChange={handleInputChange}
              required
              style={{ borderColor: '#6C8E58' }}
            />
          </CCol>
          <CCol md={4}>
            <CFormLabel>Hora de Fin</CFormLabel>
            <CFormInput
              type="time"
              name="horaFin"
              value={formValues.horaFin}
              onChange={handleInputChange}
              required
              style={{ borderColor: '#6C8E58' }}
            />
          </CCol>
        </CRow>
        {selectedCita && (
          <CRow className="mb-3">
            <CCol md={12}>
              <CFormLabel>Estado</CFormLabel>
              <select
                name="estado"
                value={formValues.estado}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '10px', borderColor: '#6C8E58' }}
              >
                <option value="Pendiente">Pendiente</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </CCol>
          </CRow>
        )}
        <CModalFooter>
          <CButton
            type="submit"
            color="success"
            style={{ backgroundColor: '#4B6251', color: 'white' }}
            disabled={isSubmitting}
          >
            <CIcon icon={cilSave} /> {isSubmitting ? 'Guardando...' : 'Guardar'}
          </CButton>
          <CButton color="secondary" onClick={handleModalClose}>
            Cancelar
          </CButton>
        </CModalFooter>
      </CCard>
    </CForm>
  </CModalBody>
</CModal>


      <CModal size="lg" visible={allCitasModalVisible} onClose={handleModalClose} backdrop="static">
        <CModalHeader closeButton style={{ backgroundColor: '#4B6251', color: 'white' }}>
          <CModalTitle>Todas las Citas</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Título</CTableHeaderCell>
                <CTableHeaderCell>Asunto</CTableHeaderCell>
                <CTableHeaderCell>Persona Requerida</CTableHeaderCell>
                <CTableHeaderCell>Fecha</CTableHeaderCell>
                <CTableHeaderCell>Hora Inicio</CTableHeaderCell>
                <CTableHeaderCell>Hora Fin</CTableHeaderCell>
                <CTableHeaderCell>Estado</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {solicitudes.map((cita) => (
                <CTableRow key={cita.id}>
                  <CTableDataCell>{cita.title}</CTableDataCell>
                  <CTableDataCell>{cita.description}</CTableDataCell>
                  <CTableDataCell>{cita.personaRequerida}</CTableDataCell>
                  <CTableDataCell>{cita.start}</CTableDataCell>
                  <CTableDataCell>{cita.horaInicio}</CTableDataCell>
                  <CTableDataCell>{cita.horaFin}</CTableDataCell>
                  <CTableDataCell>
                    <CIcon icon={getIconByEstado(cita.estado)} className="me-2" />
                    {cita.estado}
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
          <CButton color="secondary" className="mt-3" onClick={handleModalClose}>
            Cerrar
          </CButton>
        </CModalBody>
      </CModal>
    </CContainer>
  );
};

export default Solicitud;