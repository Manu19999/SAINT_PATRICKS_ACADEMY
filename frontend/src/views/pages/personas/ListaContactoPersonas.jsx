import React, { useEffect, useState } from 'react'; 
import { CIcon } from '@coreui/icons-react';
import { cilSearch, cilPen, cilTrash, cilPlus, cilDescription, cilPrint, cilSave } from '@coreui/icons';
import swal from 'sweetalert2';
import '@fortawesome/fontawesome-free/css/all.min.css';
import {
  CButton,
  CContainer,
  CInputGroup,
  CInputGroupText,
  CFormInput,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CPagination,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CRow,
  CCol,
  CDropdown,
  CDropdownMenu,
  CDropdownToggle,
  CDropdownItem,
  CFormSelect,
} from '@coreui/react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const ListaContacto = () => {
  const [contacto, setContacto] = useState([]);
  const [tiposContacto, setTiposContacto] = useState([]); // Estado para almacenar los tipos de contacto
  const [modalVisible, setModalVisible] = useState(false);
  const [contactoToUpdate, setContactoToUpdate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const [nuevoContacto, setNuevoContacto] = useState({ cod_persona: '', tipo_contacto: '', Valor: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchContactos();
    fetchTiposContacto(); // Llamar a la función para cargar los tipos de contacto al montar el componente
  }, []);

  const fetchContactos = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/contacto/obtenerContacto');
      if (!response.ok) throw new Error(`Error en la solicitud: ${response.statusText}`);
      const data = await response.json();
      console.log('Datos obtenidos de la API:', data); // Verifica la respuesta de la API
      setContacto(data);
      console.log('Estado de contacto después de setContacto:', contacto); // Verifica el estado
    } catch (error) {
      console.error('Error fetching contactos:', error);
      swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cargar la lista de contactos.' });
    }
  };
  
  const fetchTiposContacto = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/tipoContacto/obtenerTipoContacto');
      if (!response.ok) throw new Error(`Error en la solicitud: ${response.statusText}`);
      const data = await response.json();
      setTiposContacto(data.map(item => item.tipo_contacto)); // Extraer solo la columna 'tipo_contacto'
    } catch (error) {
      console.error('Error fetching tipos de contacto:', error);
      swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cargar los tipos de contacto.' });
    }
  };

  const exportToExcel = () => {
    if (!filteredContacto.length) return swal.fire({ icon: 'warning', title: 'Sin Datos', text: 'No hay datos para exportar.' });

    const fileName = prompt("Ingrese el nombre del archivo para el reporte Excel:", searchTerm ? `Reporte_Contactos_Filtrados_${searchTerm}` : "Reporte_Contactos");
    if (!fileName) return;

    const worksheet = XLSX.utils.json_to_sheet(filteredContacto.map((item, index) => ({
      "#": index + 1,
      "Código Persona": item.cod_persona,
      "Tipo de Contacto": item.tipo_contacto,
      "Valor": item.Valor,
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contactos');
    const blob = new Blob([XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${fileName}.xlsx`);
  };

  const exportToPDF = () => {
    const fileName = prompt("Ingrese el nombre del archivo para el reporte PDF:", searchTerm ? `Reporte_Contactos_Filtrados_${searchTerm}` : "Reporte_Contactos");
    if (!fileName) return;

    const doc = new jsPDF();
    doc.text('Reporte de Contactos', 20, 10);
    doc.autoTable({
      head: [['#', 'Código Persona', 'Tipo de Contacto', 'Valor']],
      body: filteredContacto.map((item, index) => [index + 1, item.cod_persona, item.tipo_contacto, item.Valor]),
    });
    doc.save(`${fileName}.pdf`);
  };

  const handlePrintGeneral = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Imprimir Reporte General</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid #000;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
            }
          </style>
        </head>
        <body>
          <h1>Reporte de Contactos</h1>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Código Persona</th>
                <th>Tipo de Contacto</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              ${filteredContacto.map((item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.cod_persona}</td>
                  <td>${item.tipo_contacto}</td>
                  <td>${item.Valor}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const exportIndividualToExcel = (item, index) => {
    const fileName = prompt("Ingrese el nombre del archivo Excel:", `Reporte_Contacto_${item.cod_persona}_${index + 1}`);
    if (!fileName) return;

    const worksheet = XLSX.utils.json_to_sheet([{
      "Número": index + 1,
      "Código Persona": item.cod_persona,
      "Tipo de Contacto": item.tipo_contacto,
      "Valor": item.Valor,
    }]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte_Contacto');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${fileName}.xlsx`);
  };

  const exportIndividualToPDF = (item, index) => {
    const fileName = prompt("Ingrese el nombre del archivo PDF:", `Reporte_Contacto_${item.cod_persona}_${index + 1}`);
    if (!fileName) return;

    const doc = new jsPDF();
    doc.text('Reporte de Contacto', 20, 10);
    doc.text(`Número: ${index + 1}`, 20, 20);
    doc.text(`Código Persona: ${item.cod_persona}`, 20, 30);
    doc.text(`Tipo de Contacto: ${item.tipo_contacto}`, 20, 40);
    doc.text(`Valor: ${item.Valor}`, 20, 50);
    doc.save(`${fileName}.pdf`);
  };

  const handlePrintIndividual = (item, index) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Imprimir Contacto</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
            }
            h1 {
              text-align: center;
            }
            .record {
              border: 1px solid #000;
              padding: 10px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <h1>Reporte de Contacto</h1>
          <div class="record">
            <p><strong>Número:</strong> ${index + 1}</p>
            <p><strong>Código Persona:</strong> ${item.cod_persona}</p>
            <p><strong>Tipo de Contacto:</strong> ${item.tipo_contacto}</p>
            <p><strong>Valor:</strong> ${item.Valor}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleCreateOrUpdate = async () => {
    if (isSubmitting) return;
  
    const errors = [];
    const contactoActual = contactoToUpdate ? contactoToUpdate : nuevoContacto;
  
    // Validaciones de campos vacíos para creación y edición
    if (!contactoActual.cod_persona || contactoActual.cod_persona.trim() === '') {
      errors.push("El campo 'Código Persona' no debe estar vacío.");
    } else if (isNaN(contactoActual.cod_persona) || parseInt(contactoActual.cod_persona) <= 0) {
      errors.push("El 'Código Persona' debe ser un número entero positivo.");
    } else if (contactoActual.cod_persona.toString().length > 11) {
      errors.push("El 'Código Persona' no debe tener más de 11 dígitos.");
    }
  
    if (!contactoActual.tipo_contacto || contactoActual.tipo_contacto.trim() === '') {
      errors.push("El campo 'Tipo de Contacto' no debe estar vacío.");
    }
  
    if (!contactoActual.Valor || contactoActual.Valor.trim() === '') {
      errors.push("El campo 'Valor' no debe estar vacío.");
    } else if (contactoActual.Valor.length > 100) {
      errors.push("El campo 'Valor' no debe exceder los 100 caracteres.");
    } else {
      const valorRegex = /[aeiouáéíóúü0-9]/i;
      if (!valorRegex.test(contactoActual.Valor)) {
        errors.push("El campo 'Valor' debe contener al menos una vocal o un número.");
      }
    }
  
    // Validación de duplicados mejorada
    const duplicados = contacto.filter(item => {
      // Si es el mismo registro que estamos editando, lo ignoramos
      if (contactoToUpdate && item.cod_contacto === contactoToUpdate.cod_contacto) {
        return false;
      }
      // Verificamos si el código persona o el valor coinciden con algún otro registro
      return item.cod_persona === contactoActual.cod_persona || 
             item.Valor.toLowerCase() === contactoActual.Valor.toLowerCase();
    });
  
    if (duplicados.length > 0) {
      let mensajeDuplicados = "Se encontraron los siguientes datos duplicados:<br/><br/>";
      
      // Verificamos específicamente qué campos están duplicados
      const duplicadoCodPersona = duplicados.find(item => item.cod_persona === contactoActual.cod_persona);
      const duplicadoValor = duplicados.find(item => item.Valor.toLowerCase() === contactoActual.Valor.toLowerCase());
      
      if (duplicadoCodPersona) {
        mensajeDuplicados += `El Código Persona '${duplicadoCodPersona.cod_persona}' ya existe en otro registro.<br/>`;
      }
      
      if (duplicadoValor) {
        mensajeDuplicados += `El Valor '${duplicadoValor.Valor}' ya existe en otro registro.`;
      }
  
      swal.fire({
        icon: 'warning',
        title: 'Error de duplicado',
        html: mensajeDuplicados
      });
      return;
    }
  
    // Mostrar errores si hay
    if (errors.length > 0) {
      swal.fire({
        icon: 'warning',
        title: 'Errores en el formulario',
        html: errors.join('<br/>')
      });
      return;
    }
  
    // Proceder con la creación o actualización
    setIsSubmitting(true);
    const url = contactoToUpdate
      ? `http://localhost:4000/api/contacto/actualizarContacto/${contactoToUpdate.cod_contacto}`
      : 'http://localhost:4000/api/contacto/crearContacto';
    const method = contactoToUpdate ? 'PUT' : 'POST';
    const body = JSON.stringify(contactoActual);
  
    try {
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body });
      const result = await response.json();
  
      // ... resto del código igual hasta el bloque if(response.ok) ...

      if (response.ok) {
        swal.fire({
          icon: 'success',
          title: contactoToUpdate ? 'Contacto actualizado' : 'Contacto creado',
          text: result.Mensaje || 'Operación realizada con éxito',
        });
      
        if (contactoToUpdate) {
          // Actualiza el registro específico
          setContacto((prevContactos) =>
            prevContactos.map((item) =>
              item.cod_contacto === contactoToUpdate.cod_contacto
                ? { ...item, ...contactoToUpdate } // Actualiza solo este registro
                : item // Los demás registros quedan intactos
            )
          );
        } else {
          // Agregar un nuevo registro si es una creación
          setContacto((prevContactos) => [
            ...prevContactos,
            { cod_contacto: result.cod_contacto, ...nuevoContacto },
          ]);
        }
      
        // Limpia los valores y cierra el modal
        setNuevoContacto({ cod_persona: '', tipo_contacto: '', Valor: '' });
        setContactoToUpdate(null);
        setModalVisible(false);
      }
      

    } catch (error) {
      console.error("Error en la solicitud:", error);
      swal.fire({ icon: 'error', title: 'Error', text: 'Error en el servidor.' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  
  const handleDeleteContacto = async (cod_contacto, descripcionContacto) => {
    try {
      const confirmResult = await swal.fire({
        title: 'Confirmar Eliminación',
        html: `¿Estás seguro de que deseas eliminar el contacto: <strong>${descripcionContacto || 'Sin descripción'}</strong>?`,
        showCancelButton: true,
        confirmButtonColor: '#FF6B6B',
        cancelButtonColor: '#6C757D',
        confirmButtonText: '<i class="fa fa-trash"></i> Eliminar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
        focusCancel: true,
      });
  
      if (!confirmResult.isConfirmed) return;
  
      const response = await fetch(
        `http://localhost:4000/api/contacto/eliminarContacto/${encodeURIComponent(cod_contacto)}`,
        { method: 'DELETE' }
      );
  
      const result = await response.json();
  
      if (response.ok) {
        setContacto((prevContactos) =>
          prevContactos.filter((item) => item.cod_contacto !== cod_contacto)
        );
  
        swal.fire({
          icon: 'success',
          title: 'Contacto eliminado',
          text: result.Mensaje || 'Eliminado correctamente',
        });
      } else {
        throw new Error(result.Mensaje || 'Error al eliminar');
      }
    } catch (error) {
      console.error('Error eliminando el contacto:', error);
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo eliminar el contacto.',
      });
    }
  };  

  const handleRecordsPerPageChange = (e) => {
    setRecordsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const filteredContacto = contacto.filter((item) =>
    (item.cod_persona || '').toString().includes(searchTerm) || (item.Valor || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredContacto.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.max(1, Math.ceil(filteredContacto.length / recordsPerPage));

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <CContainer>
      <CRow className="align-items-center mb-5">
        <CCol xs="8" md="9"><h1>Mantenimiento Contactos</h1></CCol>
        <CCol xs="4" md="3" className="text-end">
          <CButton style={{ backgroundColor: '#4B6251', color: 'white' }} onClick={() => { setModalVisible(true); setContactoToUpdate(null); }}>
            <CIcon icon={cilPlus} /> Nuevo
          </CButton>
          <CDropdown className="ms-3">
            <CDropdownToggle style={{ backgroundColor: '#6C8E58', color: 'white' }}>
              <CIcon icon={cilDescription} /> Reporte
            </CDropdownToggle>
            <CDropdownMenu>
              <CDropdownItem onClick={exportToExcel}>
                <i className="fa fa-file-excel-o" style={{ marginRight: '5px' }}></i> Descargar en Excel
              </CDropdownItem>
              <CDropdownItem onClick={exportToPDF}>
                <i className="fa fa-file-pdf-o" style={{ marginRight: '5px' }}></i> Descargar en PDF
              </CDropdownItem>
              <CDropdownItem onClick={handlePrintGeneral}>
                <CIcon icon={cilPrint} /> Imprimir
              </CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
          <div className="mt-2" style={{ textAlign: 'right' }}>
            <span>Mostrar </span>
            <CFormSelect
              value={recordsPerPage}
              onChange={handleRecordsPerPageChange}
              style={{ maxWidth: '70px', display: 'inline-block', margin: '0 5px' }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </CFormSelect>
            <span> registros</span>
          </div>
        </CCol>
      </CRow>

      <CInputGroup className="mb-3" style={{ maxWidth: '400px' }}>
        <CInputGroupText><CIcon icon={cilSearch} /></CInputGroupText>
        <CFormInput placeholder="Buscar por Cod Persona o Valor" onChange={handleSearch} value={searchTerm} />
        <CButton
          onClick={() => setSearchTerm('')}
          style={{
            border: '2px solid #d3d3d3',
            color: '#4B6251',
            backgroundColor: '#f0f0f0',
          }}
        >
          <i className="fa fa-broom" style={{ marginRight: '5px' }}></i> Limpiar
        </CButton>
      </CInputGroup>

      <div className="table-container" style={{ maxHeight: '400px', overflowY: 'scroll', marginBottom: '20px' }}>
        <CTable striped bordered hover>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>#</CTableHeaderCell>
              <CTableHeaderCell>Código Persona</CTableHeaderCell>
              <CTableHeaderCell>Tipo de Contacto</CTableHeaderCell>
              <CTableHeaderCell>Valor</CTableHeaderCell>
              <CTableHeaderCell>Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {currentRecords.map((item, index) => (
              <CTableRow key={item.cod_contacto}>
                <CTableDataCell>{index + 1 + indexOfFirstRecord}</CTableDataCell>
                <CTableDataCell>{item.cod_persona}</CTableDataCell>
                <CTableDataCell>{item.tipo_contacto}</CTableDataCell>
                <CTableDataCell>{item.Valor}</CTableDataCell>
                <CTableDataCell>
                  <CButton color="warning" onClick={() => { setContactoToUpdate(item); setModalVisible(true); }}>
                    <CIcon icon={cilPen} />
                  </CButton>
                  <CButton color="danger" onClick={() => handleDeleteContacto(item.cod_contacto, item.Valor)} className="ms-2">
                    <CIcon icon={cilTrash} />
                  </CButton>
                  <CDropdown className="ms-2">
                    <CDropdownToggle color="info">
                      <CIcon icon={cilDescription} />
                    </CDropdownToggle>
                    <CDropdownMenu>
                      <CDropdownItem onClick={() => exportIndividualToExcel(item, index)}>
                        <i className="fa fa-file-excel-o" style={{ marginRight: '5px' }}></i> Descargar en Excel
                      </CDropdownItem>
                      <CDropdownItem onClick={() => exportIndividualToPDF(item, index)}>
                        <i className="fa fa-file-pdf-o" style={{ marginRight: '5px' }}></i> Descargar en PDF
                      </CDropdownItem>
                      <CDropdownItem onClick={() => handlePrintIndividual(item, index)}>
                        <CIcon icon={cilPrint} /> Imprimir
                      </CDropdownItem>
                    </CDropdownMenu>
                  </CDropdown>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </div>

      <CPagination align="center" className="my-3">
        <CButton
          style={{
            backgroundColor: '#7fa573',
            color: 'white',
            marginRight: '20px',
          }}
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Anterior
        </CButton>
        <CButton
          style={{
            backgroundColor: '#7fa573',
            color: 'white',
          }}
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages || filteredContacto.length === 0}
        >
          Siguiente
        </CButton>
        {totalPages > 0 && (
          <span style={{ marginLeft: '10px', color: 'black', fontSize: '16px' }}>
            Página {currentPage} de {totalPages}
          </span>
        )}
      </CPagination>

      <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader><CModalTitle>{contactoToUpdate ? 'Actualizar Contacto' : 'Crear Nuevo Contacto'}</CModalTitle></CModalHeader>
        <CModalBody>
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #dcdcdc', marginBottom: '10px' }}>
            <div style={{ minWidth: '150px', backgroundColor: '#f0f0f0', padding: '10px', textAlign: 'center', color: '#000', borderRight: '1px solid #dcdcdc' }}>
              Código Persona
            </div>
            <CFormInput
              placeholder="Código Persona"
              value={contactoToUpdate?.cod_persona || nuevoContacto.cod_persona}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 11);
                contactoToUpdate
                  ? setContactoToUpdate({ ...contactoToUpdate, cod_persona: value })
                  : setNuevoContacto({ ...nuevoContacto, cod_persona: value });
              }}
              className="border-0"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #dcdcdc', marginBottom: '10px' }}>
            <div style={{ minWidth: '150px', backgroundColor: '#f0f0f0', padding: '10px', textAlign: 'center', color: '#000', borderRight: '1px solid #dcdcdc' }}>
              Tipo de Contacto
            </div>
            <CFormSelect
              value={contactoToUpdate?.tipo_contacto || nuevoContacto.tipo_contacto}
              onChange={(e) => {
                const value = e.target.value;
                contactoToUpdate
                  ? setContactoToUpdate({ ...contactoToUpdate, tipo_contacto: value })
                  : setNuevoContacto({ ...nuevoContacto, tipo_contacto: value });
              }}
              className="border-0"
            >
              <option value="">Seleccione un tipo de contacto</option>
              {tiposContacto.map((tipo, index) => (
                <option key={index} value={tipo}>{tipo}</option>
              ))}
            </CFormSelect>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #dcdcdc', marginBottom: '10px' }}>
            <div style={{ minWidth: '150px', backgroundColor: '#f0f0f0', padding: '10px', textAlign: 'center', color: '#000', borderRight: '1px solid #dcdcdc' }}>
              Valor
            </div>
            <CFormInput
              placeholder="Valor"
              value={contactoToUpdate?.Valor || nuevoContacto.Valor}
              onChange={(e) => {
                let value = e.target.value.slice(0, 50); // Limitar a 50 caracteres
                // Bloquear si hay más de un espacio entre palabras/números
                if (/(\s{2,})/.test(value)) return;
                contactoToUpdate
                  ? setContactoToUpdate({ ...contactoToUpdate, Valor: value })
                  : setNuevoContacto({ ...nuevoContacto, Valor: value });
              }}
              className="border-0"
            />
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>Cancelar</CButton>
          <CButton
            onClick={handleCreateOrUpdate}
            style={
              contactoToUpdate
                ? { backgroundColor: '#FFD700', color: 'white' } // Color amarillo con letras blancas
                : { backgroundColor: '#4B6251', color: 'white' } // Mantener el estilo actual del botón "Guardar"
            }
          >
            <CIcon icon={contactoToUpdate ? cilPen : cilSave} />
            &nbsp;
            {contactoToUpdate ? 'Actualizar' : 'Guardar'}
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};

export default ListaContacto;

