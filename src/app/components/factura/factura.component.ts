import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  Component,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import * as FileSaver from 'file-saver'; // Importar FileSaver
import { jsPDF } from 'jspdf';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx'; // Importar XLSX

import { AuthService } from '../../services/auth.service';
import { FacturacionService } from '../../services/facturacion.service';
import { UserService } from '../../services/user.service';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-factura',
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './factura.component.html',
  styleUrl: './factura.component.css',
})
export class FacturaComponent implements OnInit {
  factura: any = {
    seller: '',
    sellerName: '',
    clientName: '',
    clientID: '',
    clientgmail: '',
    clientciudad: '',
    clientdireccion: '',
    clienttelefono: '',
    price: 0,
    units: 1,
    gift: false,
    tipodepago: '',
    total: 0,
    fecha: new Date().toISOString(), // Formato ISO para la fecha
  };
  sales: any[] = [];
  showSalesData = true;
  errorMessage: string = '';
  successMessage: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 8;
  sellerStock: number = 0;
  email: string = 'agomez.desarrollo@andrespublicidadtg.com';
  constructor(
    private facturacion: FacturacionService,
    private toastr: ToastrService,
    private authService: AuthService,
    private userService: UserService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.obtenerVentas();
    this.calculateTotal();
    this.obtenerInformacionVendedor();
  }
  obtenerInformacionVendedor() {
    const userId = this.authService.getUserId();
    if (userId) {
      this.factura.seller = userId; // Asignar el ID del usuario al vendedor
      this.userService.getUserById(userId).subscribe(
        (user) => {
          this.factura.sellerName = `${user.nombre} ${user.apellido}`;
          this.sellerStock = user.stock ?? 0; // Asignar el stock del vendedor
        },
        (error) => {
          this.errorMessage = 'Error al obtener la información del vendedor';
          this.toastr.error(this.errorMessage, 'Error');
        }
      );
    } else {
      // Manejar el caso en que no se encuentre el ID del usuario
      this.errorMessage = 'No se pudo obtener el ID del usuario';
      this.toastr.error(this.errorMessage, 'Error');
    }
  }

  onSubmit() {
    if (
      this.factura.seller == '' ||
      this.factura.clientName == '' ||
      this.factura.clientID == '' ||
      this.factura.clientgmail == '' ||
      this.factura.clientciudad == '' ||
      this.factura.clientdireccion == '' ||
      this.factura.clienttelefono == '' ||
      this.factura.price == 0 ||
      this.factura.tipodepago == ''
    ) {
      this.errorMessage = 'Todos los campos son obligatorios';
      console.log(this.errorMessage);
      return;
    }
    if (this.factura.units > this.sellerStock) {
      this.errorMessage = 'Las unidades exceden el stock disponible';
      this.toastr.warning('', 'Las unidades exceden el stock disponible');
      console.log(this.errorMessage);
      return;
    }
    this.facturacion.registrarFactura(this.factura).subscribe(
      (response) => {
        this.successMessage = 'Factura registrada correctamente';
        this.toastr.success('', 'Factura registrada correctamente');
        this.errorMessage = '';
        this.obtenerVentas(); // Recargar las ventas después de registrar una nueva factura
       //this.downloadInvoice(); // Generar el PDF después de registrar la factura
        this.sendInvoiceByEmail(); // Enviar la factura por correo electrónico
        this.resetForm();
        this.obtenerInformacionVendedor();
      },
      (error) => {
        this.errorMessage = 'Error al registrar la factura';
        this.successMessage = '';
        this.toastr.error('', 'Error al registrar la factura');
      }
    );
  }
  resetForm(): void {
    this.factura = {
      seller: '',
      clientName: '',
      clientID: '',
      clientgmail: '',
      clientciudad: '',
      clientdireccion: '',
      clienttelefono: '',
      price: '',
      units: 1,
      gift: false,
      tipodepago: '',
      total: 0,
      fecha: new Date().toISOString(), // Formato ISO para la fecha
    };
  }

  calculateTotal(): void {
    const price = parseInt(this.factura.price, 10);
    const units = this.factura.units;
    const total = price * units;
    this.factura.total = this.formatNumber(total);
  }
  formatNumber(value: number): string {
    return value.toLocaleString('es-CO');
  }
  obtenerVentas(): void {
    this.facturacion.getFactura().subscribe(
      (data: any) => {
        if (Array.isArray(data)) {
          this.sales = data;
        } else {
        }
      },
      (error: any) => {
        this.toastr.error('', 'ERROR AL OBTENER LAS VENTAS');
      }
    );
  }

  toggleSalesData() {
    this.showSalesData = !this.showSalesData;
  }

  get paginatedSales(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.sales.slice(startIndex, endIndex);
  }

  nextPage(): void {
    if (this.currentPage * this.itemsPerPage < this.sales.length) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  downloadInvoice() {
    const doc = new jsPDF();
    const imgData = 'WhatsApp Image 2025-01-13 at 5.03.52 PM.jpeg';
    doc.addImage(imgData, 'JPEG', 0, 0, 210, 297)
    // Datos de la factura
    const {
      sellerName,
      clientName,
      clientID,
      clientgmail,
      clientciudad,
      clientdireccion,
      clienttelefono,
      price,
      units,
      gift,
      tipodepago,
      total,
    } = this.factura;
  
    // Número y fecha de la factura
    const invoiceNumber = Math.floor(Math.random() * 1000000).toString();
    const invoiceDate = new Date().toLocaleDateString();
  
    // Encabezado (membrete)
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Tarot Latinoamerica', 105, 15, { align: 'center' });
  
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Dirección: Calle 14 #23-52, Ciudad de Pereira', 105, 22, {
      align: 'center',
    });
    doc.text(
      'Teléfono: +57 3242341917 | Email: andrespublicidad@andrespublicidadtg.com',
      105,
      28,
      { align: 'center' }
    );
    doc.text(
      'Compañía: ANDRÉS PUBLICIDAD TG S.A.S | NIT: 901458142',
      105,
      34,
      { align: 'center' }
    );
  
    // Línea divisoria
    doc.setDrawColor(0, 0, 0);
    doc.line(10, 40, 200, 40);
  
    // Título de la factura
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Factura de Venta', 105, 48, { align: 'center' });
  
    // Número y fecha de la factura
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Número de Factura: ${invoiceNumber}`, 20, 60);
    doc.text(`Fecha: ${invoiceDate}`, 160, 60);
  
    // Sección: Datos del cliente
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Datos del Cliente', 20, 70);
  
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nombre: ${clientName}`, 20, 80);
    doc.text(`ID: ${clientID}`, 20, 86);
    doc.text(`Correo: ${clientgmail}`, 20, 92);
    doc.text(`Ciudad: ${clientciudad}`, 20, 98);
    doc.text(`Dirección: ${clientdireccion}`, 20, 104);
    doc.text(`Teléfono: ${clienttelefono}`, 20, 110);
  
    // Sección: Detalles de la venta
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Detalles de la Venta', 20, 120);
  
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Vendedor: ${sellerName}`, 20, 130);
    doc.text(`Precio Unitario: $${price.toLocaleString()}`, 20, 136);
    doc.text(`Unidades: ${units}`, 20, 142);
    doc.text(`Incluyó Regalo: ${gift ? 'Sí' : 'No'}`, 20, 148);
    doc.text(`Tipo de pago: ${tipodepago}`, 20, 154);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total a Pagar: $${total.toLocaleString()}`, 20, 160);
  
    // Línea divisoria
    doc.line(10, 170, 200, 170);
  
    // Pie de página
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Gracias por su compra. ¡Esperamos verlo pronto!', 105, 190, {
      align: 'center',
    });
  
    // Descargar el PDF
    doc.save(`Factura_${clientName.replace(/\s+/g, '_')}.pdf`);
   return doc.output('blob');
   
  }
  sendInvoiceByEmail() {
    const pdfBlob = this.downloadInvoice();
    const formData = new FormData();
     formData.append('pdf', pdfBlob, 'factura.pdf'); 
    formData.append('email', this.email);

    this.http.post('http://localhost:3010/api/send-invoice', formData).subscribe(
      (response) => {
        this.toastr.success('Factura enviada por correo electrónico', 'Éxito');
      },
      (error) => {
        this.toastr.error('Error al enviar la factura por correo electrónico', 'Error');
        console.error('Error al enviar la factura por correo electrónico:', error);
      }
    );
  }
  downloadSalesExcel() {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.sales);
    const workbook: XLSX.WorkBook = { Sheets: { 'Ventas': worksheet }, SheetNames: ['Ventas'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, 'ventas');
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(data, `${fileName}_export_${new Date().getTime()}.xlsx`);
  }
}
