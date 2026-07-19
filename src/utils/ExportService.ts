import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useStadiumStore } from '../store/stadiumStore';

export class ExportService {
  static exportShiftHandover() {
    const state = useStadiumStore.getState();
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('FIFA 26 Operations Control Center', 14, 22);
    doc.setFontSize(14);
    doc.text('Shift Handover Audit Report', 14, 32);
    
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 42);
    doc.text(`Simulation Time: ${Math.floor(state.simTime / 60)}m ${state.simTime % 60}s`, 14, 48);

    // Incidents Table
    const activeIncidents = state.incidents.filter(i => i.status !== 'resolved');
    const resolvedIncidents = state.incidents.filter(i => i.status === 'resolved');
    
    doc.setFontSize(12);
    doc.text('Active Incidents', 14, 60);
    
    autoTable(doc, {
      startY: 65,
      head: [['Severity', 'Type', 'Title', 'Location']],
      body: activeIncidents.map(i => [
        i.severity.toUpperCase(), 
        i.type, 
        i.title, 
        i.location
      ]),
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    let finalY = (doc as any).lastAutoTable.finalY || 65;
    
    doc.text('Resolved Incidents', 14, finalY + 15);
    
    autoTable(doc, {
      startY: finalY + 20,
      head: [['Severity', 'Type', 'Title', 'Location']],
      body: resolvedIncidents.map(i => [
        i.severity.toUpperCase(), 
        i.type, 
        i.title, 
        i.location
      ]),
      theme: 'grid',
      headStyles: { fillColor: [39, 174, 96] }
    });
    
    finalY = (doc as any).lastAutoTable.finalY || finalY + 20;

    // Metrics Summary
    doc.text('System Metrics', 14, finalY + 15);
    const totalOccupancy = Object.values(state.zones).reduce((acc, z) => acc + z.currentOccupancy, 0);
    const totalCapacity = Object.values(state.zones).reduce((acc, z) => acc + z.maxCapacity, 0);
    
    autoTable(doc, {
      startY: finalY + 20,
      head: [['Metric', 'Value']],
      body: [
        ['Total Occupancy', `${Math.floor(totalOccupancy)} / ${totalCapacity}`],
        ['Incidents (Active/Total)', `${activeIncidents.length} / ${state.incidents.length}`],
        ['Available Teams', Object.values(state.teams).filter(t => t.status === 'idle').length.toString()]
      ],
      theme: 'grid'
    });

    // Save PDF
    doc.save(`shift_handover_${new Date().getTime()}.pdf`);
  }
}
