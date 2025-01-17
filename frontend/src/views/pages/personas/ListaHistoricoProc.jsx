import React, { useEffect, useState } from 'react';
import { CIcon } from '@coreui/icons-react';
import { cilSearch,cilBrushAlt, cilPen, cilTrash, cilPlus, cilSave, cilDescription } from '@coreui/icons';
import swal from 'sweetalert2'; // Importar SweetAlert para mostrar mensajes de advertencia y éxito
import * as XLSX from 'xlsx';        // Para generar archivos Excel
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import logo from 'src/assets/brand/logo_saint_patrick.png';


import {
  CButton,
  CCol,
  CContainer,
  CDropdown,//Para reportes
  CDropdownMenu,
  CDropdownToggle,
  CDropdownItem,//Para reportes
  CForm,
  CFormInput,
  CFormSelect,
  CInputGroup,
  CInputGroupText,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CPagination,
  CRow,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react';
import usePermission from '../../../../context/usePermission';
import AccessDenied from "../AccessDenied/AccessDenied"



const ListaHistoricoProc = () => {

  const { canSelect, canDelete, canInsert, canUpdate } = usePermission('ListaHistoricoProc');

   // Estados de la aplicación
  const [historicoProcedencia, setHistoricoProcedencia] = useState([]); // Estado que almacena la lista de histórico de procedencia
  const [errors, setErrors] = useState({ Nombre_procedencia: '', Lugar_procedencia: '', Instituto: '' }); // Estado para gestionar los errores de validación
  const [modalVisible, setModalVisible] = useState(false); // Controla la visibilidad del modal de creación
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false); // Controla la visibilidad del modal de actualización
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false); // Controla la visibilidad del modal de eliminación
  const [nuevoHistorico, setNuevoHistorico] = useState({ Nombre_procedencia: '', Lugar_procedencia: '', Instituto: '' }); // Estado del nuevo registro
  const [historicoToUpdate, setHistoricoToUpdate] = useState({}); // Estado para el registro que se va a actualizar
  const [historicoToDelete, setHistoricoToDelete] = useState({}); // Estado para el registro que se va a eliminar
  const [searchTerm, setSearchTerm] = useState(''); // Estado del término de búsqueda
  const [currentPage, setCurrentPage] = useState(1); // Estado de la página actual para la paginación
  const [recordsPerPage, setRecordsPerPage] = useState(5); // Controla cuántos registros se muestran por página
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Controla si hay cambios sin guardar
  const [errorMensaje, setErrorMensaje] = useState(""); // Estado para almacenar el mensaje de error

    // useEffect para cargar el histórico de procedencia al montar el componente
    useEffect(() => {
        fetchHistoricoProcedencia(); // Llama a la función para obtener el histórico de procedencia desde el backend
    }, []);

  // Función para obtener el histórico de procedencia desde la API
  const fetchHistoricoProcedencia = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/historial_proc/historico_procedencia'); // Realiza la petición al backend
      const data = await response.json(); // Convierte la respuesta a JSON
      const dataWithIndex = data.map((historico, index) => ({
        ...historico,
        originalIndex: index + 1, // Añade un índice basado en la posición del registro en la lista
      }));
      setHistoricoProcedencia(dataWithIndex); // Actualiza el estado con los datos obtenidos
    } catch (error) {
      console.error('Error al obtener el histórico de procedencia:', error); // Muestra el error en la consola si la petición falla
    }
  };


  const exportToExcel = () => {
    // Transforma los datos: convierte los campos de texto a mayúsculas y excluye `cod_procedencia`
    const historicoConFormato = historicoProcedencia.map((item, index) => ({
        '#': index + 1, // Índice personalizado
        Nombre_procedencia: item.Nombre_procedencia.toUpperCase(),
        Lugar_procedencia: item.Lugar_procedencia.toUpperCase(),
        Instituto: item.Instituto.toUpperCase()
    }));

    // Convierte los datos a formato de hoja de cálculo
    const worksheet = XLSX.utils.json_to_sheet(historicoConFormato); 
    const workbook = XLSX.utils.book_new(); // Crea un nuevo libro de trabajo
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Historial Procedencia'); // Añade la hoja

    // Genera el archivo Excel en formato binario
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Crea un Blob para descargar el archivo con file-saver
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'reporte_historial_procedencia.xlsx'); // Descarga el archivo Excel
};
const exportToPDF = () => {
  const doc = new jsPDF();

  // Cargar el logo
  const img = new Image();
  img.src = logo; // Ruta de tu logo

  img.onload = () => {
      const pageWidth = doc.internal.pageSize.width;

      // Agregar el logo
      doc.addImage(img, 'PNG', 10, 10, 45, 45);

      // Cabecera principal
      doc.setFontSize(18);
      doc.setTextColor(0, 102, 51); // Verde
      doc.text("SAINT PATRICK'S ACADEMY", pageWidth / 2, 24, { align: 'center' });

      // Información de contacto
      doc.setFontSize(10);
      doc.setTextColor(100); // Gris
      doc.text('Casa Club del periodista, Colonia del Periodista', pageWidth / 2, 32, { align: 'center' });
      doc.text('Teléfono: (504) 2234-8871', pageWidth / 2, 37, { align: 'center' });
      doc.text('Correo: info@saintpatrickacademy.edu', pageWidth / 2, 42, { align: 'center' });

      // Título del reporte
      doc.setFontSize(14);
      doc.setTextColor(0, 102, 51); // Verde
      doc.text('Reporte de Historial Procedencia', pageWidth / 2, 50, { align: 'center' });

      // Línea divisoria
      doc.setLineWidth(0.5);
      doc.setDrawColor(0, 102, 51); // Verde
      doc.line(10, 55, pageWidth - 10, 55);

      // Preparar los datos
      const historicoConFormato = historicoProcedencia.map((item, index) => ({
          '#': index + 1,
          Nombre_procedencia: item.Nombre_procedencia.toUpperCase(),
          Lugar_procedencia: item.Lugar_procedencia.toUpperCase(),
          Instituto: item.Instituto.toUpperCase()
      }));

      // Generar la tabla
      doc.autoTable({
          head: [['#', 'Nombre Procedencia', 'Lugar Procedencia', 'Instituto']],
          body: historicoConFormato.map(item => [
              item['#'], 
              item.Nombre_procedencia, 
              item.Lugar_procedencia, 
              item.Instituto
          ]),
          headStyles: {
              fillColor: [0, 102, 51], // Verde
              textColor: [255, 255, 255], // Blanco
              fontSize: 10,
              halign: 'center', // Centrado por defecto
          },
          styles: {
              fontSize: 10,
              cellPadding: 3,
          },
          alternateRowStyles: {
              fillColor: [240, 248, 255], // Azul claro
          },
          columnStyles: {
              0: { halign: 'center' }, // Centro para el número
              1: { halign: 'left' }, // Alineado a la izquierda para el texto
          },
          margin: { top: 70, bottom: 30 },
          didDrawPage: function (data) {
              const pageHeight = doc.internal.pageSize.height;
              const pageCount = doc.internal.getNumberOfPages();
              const pageCurrent = doc.internal.getCurrentPageInfo().pageNumber;

              // Pie de página
              doc.setFontSize(10);
              doc.setTextColor(0, 102, 51); // Verde
              doc.text(
                  `Página ${pageCurrent} de ${pageCount}`,
                  pageWidth - 10,
                  pageHeight - 10,
                  { align: 'right' }
              );

              const now = new Date();
              const dateString = now.toLocaleDateString('es-HN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
              });
              const timeString = now.toLocaleTimeString('es-HN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
              });
              doc.text(`Fecha de generación: ${dateString} Hora: ${timeString}`, 10, pageHeight - 10);
          }
      });

      // Mostrar el PDF en una nueva ventana
      const pdfData = doc.output('bloburl');
      window.open(pdfData);
  };

  img.onerror = () => {
      console.warn('No se pudo cargar el logo. El PDF se generará sin el logo.');
  };
};


  // Estado para los mensajes de error por campo
  const [errorCampos, setErrorCampos] = useState({
    Nombre_procedencia: '',
    Lugar_procedencia: '',
    Instituto: ''
  });
  
  // Función para manejar el cambio en los campos de texto
  const handleNombreInputChange = (e, setState) => {
    const { name, value } = e.target;
    
    // Limpiamos el mensaje de error previo del campo correspondiente
    setErrorCampos(prevErrors => ({
      ...prevErrors,
      [name]: ''
    }));
  
    // Validaciones
    const isValid = validateNombre(value, name, setErrorCampos);
  
    if (isValid) {
      setState(prevState => ({ ...prevState, [name]: value }));
    }
  };
  
  // Función de validación
  const validateNombre = (value, campo, setErrorCampos) => {
    
 

// 1. No permitir caracteres especiales (solo letras, números y espacios)
const permitirCaracteresValidos = (texto) => /^[a-zA-Z0-9\s]*$/.test(texto);
if (!permitirCaracteresValidos(value)) {
  setErrorCampos(prevErrors => ({
    ...prevErrors,
    [campo]: 'No se permiten caracteres especiales.'
  }));
  setTimeout(() => setErrorCampos(prevErrors => ({ ...prevErrors, [campo]: '' })), 3000); // El mensaje desaparece después de 3 segundos
  return false; // Retorna false si hay un error
}

// 2. No permitir números
const contieneNumeros = (texto) => /\d/.test(texto);
if (contieneNumeros(value)) {
  setErrorCampos(prevErrors => ({
    ...prevErrors,
    [campo]: 'No se permiten números.'
  }));
  setTimeout(() => setErrorCampos(prevErrors => ({ ...prevErrors, [campo]: '' })), 3000); // El mensaje desaparece después de 3 segundos
  return false; // Retorna false si hay un error
}

// 3. No permitir más de 2 letras consecutivas iguales
const tieneLetrasRepetidas = (texto) => /([a-zA-Z])\1\1/.test(texto);
if (tieneLetrasRepetidas(value)) {
  setErrorCampos(prevErrors => ({
    ...prevErrors,
    [campo]: 'No se permiten más de 2 letras consecutivas iguales.'
  }));
  setTimeout(() => setErrorCampos(prevErrors => ({ ...prevErrors, [campo]: '' })), 3000); // El mensaje desaparece después de 3 segundos
  return false; // Retorna false si hay un error
}

// 4. No permitir más de 3 espacios consecutivos
const tieneEspaciosConsecutivos = (texto) => /\s{3,}/.test(texto); // Verifica más de 2 espacios consecutivos
if (tieneEspaciosConsecutivos(value)) {
  setErrorCampos(prevErrors => ({
    ...prevErrors,
    [campo]: 'No se permiten más de 2 espacios consecutivos.'
  }));
  setTimeout(() => setErrorCampos(prevErrors => ({ ...prevErrors, [campo]: '' })), 3000); // El mensaje desaparece después de 3 segundos
  return false; // Retorna false si hay un error
}

return true; // Si pasa todas las validaciones

  };
  
  // Bloquear copiar y pegar en campos
const disableCopyPaste = (e) => {
  e.preventDefault();
  setErrorMensaje('Copiar y pegar no está permitido.');
  setTimeout(() => setErrorMensaje(''), 5000); // Eliminar mensaje después de 5 segundos
};
  // Maneja el cierre de los modales con advertencia si hay cambios sin guardar
  const handleCloseModal = () => {
    swal.fire({
        title: '¿Estás seguro?',
        text: 'Tienes cambios sin guardar. ¿Deseas cerrar el modal?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, cerrar',
        cancelButtonText: 'Cancelar',
      }).then((result) => {
        if (result.isConfirmed) {
          setModalVisible(false);
          resetNuevoHistorico();
          setModalUpdateVisible(false);
          setModalDeleteVisible(false);
        }
      }); 
  };

  // Reiniciar el formulario de nuevo registro
  const resetNuevoHistorico = () => {
    setNuevoHistorico({ Nombre_procedencia: '', Lugar_procedencia: '', Instituto: '' });
  };

  // Reiniciar el formulario de actualización de registro
  const resetHistoricoToUpdate = () => {
    setHistoricoToUpdate({ Nombre_procedencia: '', Lugar_procedencia: '', Instituto: '' });
  };


  const handleCreateHistorico = async () => {
    console.log('Valor a enviar:', nuevoHistorico.Nombre_procedencia); // Verifica el valor
    console.log('Valor a enviar:', nuevoHistorico.Lugar_procedencia); // Verifica el valor
    console.log('Valor a enviar:', nuevoHistorico.Instituto); // Verifica el valor
  
    // Verificar si ya existe una procedencia con el mismo nombre y lugar
    const procedenciaExistente = historicoProcedencia.some(historico =>
      historico.Nombre_procedencia === nuevoHistorico.Nombre_procedencia &&
      historico.Lugar_procedencia === nuevoHistorico.Lugar_procedencia
    );
  
    if (procedenciaExistente) {
      // Actualizar el estado del errorMensaje para mostrar el mensaje de inmediato
      setErrorMensaje(`La procedencia con el nombre "${nuevoHistorico.Nombre_procedencia}" y lugar "${nuevoHistorico.Lugar_procedencia}" ya existe.`);
      return; // Detener el proceso si ya existe
    }
  
    try {
      const response = await fetch('http://localhost:4000/api/historial_proc/crear_historico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          p_Nombre_procedencia: nuevoHistorico.Nombre_procedencia,
          p_Lugar_procedencia: nuevoHistorico.Lugar_procedencia,
          p_Instituto: nuevoHistorico.Instituto,
        }),
      });
      const errorData = await response.json(); // Captura el cuerpo de la respuesta
      if (response.ok) {
        fetchHistoricoProcedencia(); // Recargar la lista de registros
        setModalVisible(false); // Cerrar el modal
        resetNuevoHistorico(); // Resetear los campos
        setNuevoHistorico({Nombre_procedencia: '', Lugar_procedencia: '', Instituto: ''});
  
        // Mostrar mensaje de éxito
        swal.fire({
          icon: 'success',
          title: 'Creación exitosa',
          text: `La procedencia "${nuevoHistorico.Nombre_procedencia}" ha sido creada correctamente.`,
        });
      } else {
        swal.fire({ icon: 'error', title: 'Error', text: `${errorData.mensaje || 'Error desconocido'}` });
        console.error('Hubo un error al crear la procedencia', response.statusText, errorData); 
      }
    } catch (error) {
      console.error('Error al crear la procedencia:', error);
      swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'Ocurrió un problema al conectarse con el servidor.',
      });
    }
  };
  

// Función para actualizar un registro en el histórico de procedencia
const handleUpdateHistorico = async () => {
  console.log('Valor a enviar para actualización:', historicoToUpdate.Nombre_procedencia);
  console.log('Valor a enviar para actualización:', historicoToUpdate.Lugar_procedencia);
  console.log('Valor a enviar para actualización:', historicoToUpdate.Instituto);

  try {
    const response = await fetch('http://localhost:4000/api/historial_proc/actualizar_historico', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        p_cod_procedencia: historicoToUpdate.cod_procedencia,
        p_Nombre_procedencia: historicoToUpdate.Nombre_procedencia,
        p_Lugar_procedencia: historicoToUpdate.Lugar_procedencia,
        p_Instituto: historicoToUpdate.Instituto,
      }),
    });

    const errorData = await response.json();
    if (response.ok) {
      fetchHistoricoProcedencia(); // Recargar la lista de registros
      setModalUpdateVisible(false); // Cerrar el modal
      resetHistoricoToUpdate(); // Resetear los campos
      setHasUnsavedChanges(false); // Resetear cambios no guardados

      // Usamos el nombre de la procedencia que se actualizó
      const ProcedenciaCompleto = historicoToUpdate.Nombre_procedencia.toUpperCase();

      swal.fire({ 
        icon: 'success', 
        title: 'Actualización exitosa', 
        text: `Se ha actualizado correctamente la procedencia: ${ProcedenciaCompleto}.` 
      });
    } else {
      swal.fire({ 
        icon: 'error', 
        title: 'Error', 
        text: errorData?.mensaje || 'Hubo un error al actualizar la procedencia.',
      });
    }
  } catch (error) {
    console.error('Error al actualizar el registro de procedencia:', error);
    setMensajeError('Error en la conexión. Intente nuevamente.');
    swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Hubo un error en el servidor.',
    });
  }
};
const eliminarHistoricoProcedencia = async (historico) => {
  try {
    // Muestra un cuadro de confirmación antes de eliminar
    const confirmDelete = await swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar la procedencia "${historico.Nombre_procedencia}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4B6251',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    });

    // Si el usuario confirma, se ejecuta la eliminación
    if (confirmDelete.isConfirmed) {
      const response = await fetch(`http://localhost:4000/api/historial_proc/eliminar_historico/${encodeURIComponent(historico.cod_procedencia)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();

      if (response.ok) {
        // Recargar la lista de registros y mostrar mensaje de éxito
        fetchHistoricoProcedencia();
        
        // Mostrar mensaje de éxito con el nombre de la procedencia eliminada
        swal.fire({
          title: 'Éxito',
          text: `La procedencia "${historico.Nombre_procedencia}" ha sido eliminada correctamente.`,
          icon: 'success',
          confirmButtonColor: '#4B6251',
        });
      } else {
        throw new Error(result.Mensaje || 'Hubo un error al eliminar el registro.');
      }
    }
  } catch (error) {
    // Mostrar mensaje de error si algo sale mal
    swal.fire({
      title: 'Error',
      text: error.message || 'Hubo un error al eliminar el registro.',
      icon: 'error',
      confirmButtonColor: '#4B6251',
    });
  }
};

  
  // Abre el modal de actualización con los datos del registro seleccionado
  const openUpdateModal = (historico) => {
    setHistoricoToUpdate(historico);
    setModalUpdateVisible(true);
    setHasUnsavedChanges(false); // Resetear el estado de cambios no guardados
  };
  
  // Abre el modal de eliminación con los datos del registro seleccionado
  const openDeleteModal = (historico) => {
    setHistoricoToDelete(historico);
    setModalDeleteVisible(true);
  };
// Maneja la búsqueda filtrando por nombre del edificio
    const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reinicia a la primera página al buscar
  };

  // Filtra los edificios según el término de búsqueda
  const filteredHistoricos = historicoProcedencia.filter((historicop) =>
    historicop.Nombre_procedencia.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Cálculo de la paginación
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredHistoricos.slice(indexOfFirstRecord, indexOfLastRecord);

  // Función para cambiar de página en la paginación
  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= Math.ceil(filteredHistoricos.length / recordsPerPage)) {
      setCurrentPage(pageNumber);
    }
  };


    
    // Verificar permisos
    if (!canSelect) {
      return <AccessDenied />;
    }
    

    return(
        <CContainer>
  
  <CRow className="align-items-center mb-5">
      <CCol xs="8" md="9">
        <h2 className="mb-0">Mantenimiento Historial Procedencia</h2>
      </CCol>
      <CCol xs="4" md="3" className="text-end d-flex flex-column flex-md-row justify-content-md-end align-items-md-center">
        <CButton 
          style={{ backgroundColor: '#4B6251', color: 'white' }} 
          className="mb-3 mb-md-0 me-md-3" 
          onClick={() => setModalVisible(true)} // Si necesitas la funcionalidad para "Nuevo"
        >
          <CIcon icon={cilPlus} /> Nuevo
        </CButton>

        {/* Botón "Reporte" que genera y descarga el PDF automáticamente */}
        <CButton
          style={{ backgroundColor: '#6C8E58', color: 'white' }}
          onClick={exportToPDF} // Genera y descarga el PDF
        >
          <CIcon icon={cilDescription} /> Reporte
        </CButton>
      </CCol>
    </CRow>
      {/* Filtro de búsqueda y selección de registros */}
      <CRow className="align-items-center mt-4 mb-2">
            {/* Barra de búsqueda  */}
            <CCol xs="12" md="8" className="d-flex flex-wrap align-items-center">
              <CInputGroup className="me-3" style={{ width: '400px' }}>
                <CInputGroupText>
                  <CIcon icon={cilSearch} />
                </CInputGroupText>
                <CFormInput
                  placeholder="Buscar procedencia"
                  onChange={handleSearch}
                  value={searchTerm}
                />
                <CButton
                  style={{border: '1px solid #ccc',
                    transition: 'all 0.1s ease-in-out', // Duración de la transición
                    backgroundColor: '#F3F4F7', // Color por defecto
                    color: '#343a40' // Color de texto por defecto
                  }}
                  onClick={() => {
                    setSearchTerm('');
                    setCurrentPage(1);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#E0E0E0'; // Color cuando el mouse sobre el boton "limpiar"
                    e.currentTarget.style.color = 'black'; // Color del texto cuando el mouse sobre el boton "limpiar"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#F3F4F7'; // Color cuando el mouse no está sobre el boton "limpiar"
                    e.currentTarget.style.color = '#343a40'; // Color de texto cuando el mouse no está sobre el boton "limpiar"
                  }}
                >
                  <CIcon icon={cilBrushAlt} /> Limpiar
                </CButton>
              </CInputGroup>
          </CCol>

      {/* Selector dinámico a la par de la barra de búsqueda */}
      <CCol xs="12" md="4" className="text-md-end mt-2 mt-md-0">
        <CInputGroup className="mt-2 mt-md-0" style={{ width: 'auto', display: 'inline-block' }}>
          <div className="d-inline-flex align-items-center">
            <span>Mostrar&nbsp;</span>
              <CFormSelect
                style={{ width: '80px', display: 'inline-block', textAlign: 'center' }}
                onChange={(e) => {
                const value = Number(e.target.value);
                setRecordsPerPage(value);
                setCurrentPage(1); // Reiniciar a la primera página cuando se cambia el número de registros
              }}
                value={recordsPerPage}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
              </CFormSelect>
            <span>&nbsp;registros</span>
          </div>       
       </CInputGroup>
     </CCol>
    </CRow>
      {/* Tabla de histórico de procedencia con tamaño fijo */}
        <div style={{ height: '300px', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px', marginBottom: '30px' }}>
        <CTable striped>
            <CTableHead style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: '#fff' }}>
            <CTableRow>
                <CTableHeaderCell className="text-center" style={{ width: '5%' }}>#</CTableHeaderCell>
                <CTableHeaderCell style={{ width: '40%' }}>Nombre de Procedencia</CTableHeaderCell>
                <CTableHeaderCell style={{ width: '40%' }}>Lugar de Procedencia</CTableHeaderCell>
                <CTableHeaderCell style={{ width: '40%' }}>Instituto</CTableHeaderCell>
                <CTableHeaderCell  style={{ width: '45%' }}>Acciones</CTableHeaderCell>
            </CTableRow>
            </CTableHead>
            <CTableBody>
            {currentRecords.map((historico) => (
                <CTableRow key={historico.cod_procedencia}>
                <CTableDataCell className="text-center">{historico.originalIndex}</CTableDataCell>
                <CTableDataCell style={{ textTransform: 'uppercase' }}>{historico.Nombre_procedencia}</CTableDataCell>
                <CTableDataCell style={{ textTransform: 'uppercase' }}>{historico.Lugar_procedencia}</CTableDataCell>
                <CTableDataCell style={{ textTransform: 'uppercase' }}>{historico.Instituto}</CTableDataCell>
                <CTableDataCell className="text-center">
                    <div className="d-flex justify-content-center">
                    <CButton
                        color="warning"
                        onClick={() => openUpdateModal(historico)}
                        style={{ marginRight: '10px' }}
                    >
                        <CIcon icon={cilPen} />
                    </CButton>
                    <CButton color="danger"size="sm" onClick={() => eliminarHistoricoProcedencia(historico)}>
                    <CIcon icon={cilTrash} />
            </CButton>
                    </div>
                </CTableDataCell>
                </CTableRow>
            ))}
            </CTableBody>
        </CTable>
        </div>

          {/* Paginación */}
      <CPagination
        align="center"
        aria-label="Page navigation example"
        activePage={currentPage}
        pages={Math.ceil(filteredHistoricos.length / recordsPerPage)}
        onActivePageChange={paginate}
      />

      {/* Botones de paginación "Anterior" y "Siguiente" */}
      <div className="d-flex justify-content-center align-items-center mt-3">
        <CButton
          style={{ backgroundColor: '#6f8173', color: '#D9EAD3' }}
          disabled={currentPage === 1}
          onClick={() => paginate(currentPage - 1)}
        >
          Anterior
        </CButton>

        <CButton
          style={{ marginLeft: '10px', backgroundColor: '#6f8173', color: '#D9EAD3' }}
          disabled={currentPage === Math.ceil(filteredHistoricos.length / recordsPerPage)}
          onClick={() => paginate(currentPage + 1)}
        >
          Siguiente
        </CButton>

        <div style={{ marginLeft: '10px' }}>
          Página {currentPage} de {Math.ceil(filteredHistoricos.length / recordsPerPage)}
        </div>
      </div>


        {/* Modal Crear Procedencia */}
    <CModal visible={modalVisible} backdrop="static">
    <CModalHeader closeButton={false}>
        <CModalTitle>Ingresar Procedencia</CModalTitle>
        <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalVisible, resetNuevoHistorico)}/>
    </CModalHeader>
    <CModalBody>
   
  <CForm>
    <CFormInput
      label="Nombre de Procedencia"
      name="Nombre_procedencia"
      value={nuevoHistorico.Nombre_procedencia}
      maxLength={80}
      onPaste={disableCopyPaste}
      onCopy={disableCopyPaste}
      style={{ textTransform: 'uppercase' }}
      onChange={(e) => handleNombreInputChange(e, setNuevoHistorico)}
    />
    {errorCampos.Nombre_procedencia && (
      <div style={{ color: 'red', marginTop: '5px' }}>
        {errorCampos.Nombre_procedencia}
      </div>
    )}

    <CFormInput
      label="Lugar de Procedencia"
      name="Lugar_procedencia"
      value={nuevoHistorico.Lugar_procedencia}
      maxLength={80}
      onPaste={disableCopyPaste}
      onCopy={disableCopyPaste}
      style={{ textTransform: 'uppercase' }}
      onChange={(e) => handleNombreInputChange(e, setNuevoHistorico)}
    />
    {errorCampos.Lugar_procedencia && (
      <div style={{ color: 'red', marginTop: '5px' }}>
        {errorCampos.Lugar_procedencia}
      </div>
    )}

    <CFormInput
      label="Instituto"
      name="Instituto"
      value={nuevoHistorico.Instituto}
      maxLength={80}
      onPaste={disableCopyPaste}
      onCopy={disableCopyPaste}
      style={{ textTransform: 'uppercase' }}
      onChange={(e) => handleNombreInputChange(e, setNuevoHistorico)}
    />
    {errorCampos.Instituto && (
      <div style={{ color: 'red', marginTop: '5px' }}>
        {errorCampos.Instituto}
      </div>
    )}
  </CForm>


    </CModalBody>

    {/* Mostrar mensaje de error si existe */}
{errorMensaje && (
  <div className="text-danger mt-2">
    {errorMensaje}
  </div>
)}
    <CModalFooter>
        <CButton color="secondary" onClick={handleCloseModal}>
        Cancelar
        </CButton>
        <CButton
        style={{ backgroundColor: '#4B6251', color: 'white' }}
        onClick={handleCreateHistorico}
        disabled={errors.Nombre_procedencia || errors.Lugar_procedencia || errors.Instituto}
        >
        Guardar
        </CButton>
    </CModalFooter>
    </CModal>


    {/* Modal Actualizar Procedencia */}
<CModal visible={modalUpdateVisible} backdrop="static">
  <CModalHeader closeButton={false}>
    <CModalTitle>Actualizar Procedencia</CModalTitle>
    <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalUpdateVisible, resetHistoricoToUpdate)} />
  </CModalHeader>
  <CModalBody>
    <CForm>
      <CFormInput
        label="Identificador"
        value={historicoToUpdate.cod_procedencia}
        readOnly
      />
      <CFormInput
        label="Nombre de Procedencia"
        value={historicoToUpdate.Nombre_procedencia || ''}
        maxLength={80}
        name="Nombre_procedencia"
        onPaste={disableCopyPaste}
        onCopy={disableCopyPaste}
        style={{ textTransform: 'uppercase' }}
        onChange={(e) => handleNombreInputChange(e, setHistoricoToUpdate)}
      />
      <CFormInput
        label="Lugar de Procedencia"
        value={historicoToUpdate.Lugar_procedencia || ''}
        maxLength={80}
        name="Lugar_procedencia"
        onPaste={disableCopyPaste}
        onCopy={disableCopyPaste}
        style={{ textTransform: 'uppercase' }}
        onChange={(e) => handleNombreInputChange(e, setHistoricoToUpdate)}
      />
      <CFormInput
        label="Instituto"
        value={historicoToUpdate.Instituto || ''}
        maxLength={80}
        name="Instituto"
        onPaste={disableCopyPaste}
        onCopy={disableCopyPaste}
        style={{ textTransform: 'uppercase' }}
        onChange={(e) => handleNombreInputChange(e, setHistoricoToUpdate)}
      />
    </CForm>
  </CModalBody>

  {/* Mostrar mensaje de error si existe */}
{errorMensaje && (
  <div className="text-danger mt-2">
    {errorMensaje}
  </div>
)}
  <CModalFooter>
    <CButton color="secondary" onClick={handleCloseModal}>
      Cancelar
    </CButton>
    <CButton
      style={{ backgroundColor: '#F9B64E', color: 'white' }}
      onClick={handleUpdateHistorico}
    >
      <CIcon icon={cilPen} style={{ marginRight: '5px' }} /> Actualizar
    </CButton>
  </CModalFooter>
</CModal>



      </CContainer>
    );
};

export default ListaHistoricoProc;
