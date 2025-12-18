window.generateAndSharePDF = async function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const form = document.getElementById('pah-form');
    const fd = new FormData(form);

    // Title
    doc.setFontSize(14);
    doc.text("POCUS PAH CARDIAC ECHO REPORT", 20, 20);
    doc.setFontSize(8);
    
    let y = 30;
    doc.text(`Operator: ${fd.get('operator') || 'N/A'}`, 20, y);
    doc.text(`Date: ${fd.get('exam_date') || 'N/A'}`, 120, y);
    y += 8;
    doc.line(20, y, 190, y); y += 10;

    const addField = (label, value) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(`${label}: ${value || 'N/A'}`, 20, y);
        y += 6;
    };

    // Mapping exhaustive fields to PDF
    doc.setFontSize(10); doc.text("MEASUREMENTS", 20, y); y += 6; doc.setFontSize(8);
    addField("LVOT Diameter", fd.get('plax_lvot_d') + " cm");
    addField("LVEDD", fd.get('plax_lv_edd'));
    addField("RVSP", fd.get('plax_rvsp') || fd.get('psax_rvsp') || 'N/A');
    addField("TAPSE", fd.get('ap_tapse_val') + " mm");
    addField("RV FAC", fd.get('ap_rv_fac'));
    addField("LV EF", fd.get('ap_lv_ef'));
    y += 5;

    doc.setFontSize(10); doc.text("SUMMARY", 20, y); y += 6; doc.setFontSize(8);
    addField("LV Size/Func", fd.get('sum_lv_size') + " / " + fd.get('sum_lv_func'));
    addField("Valves (Tri/Mit/Aor)", `${fd.get('sum_v_tri')} / ${fd.get('sum_v_mit')} / ${fd.get('sum_v_aor')}`);

    // Create the PDF Blob
    const pdfOutput = doc.output('blob');
    const filename = `Echo_Report_${fd.get('exam_date') || 'export'}.pdf`;

    // Strategy 3 Option A: Web Share API
    const file = new File([pdfOutput], filename, { type: 'application/pdf' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
            await navigator.share({
                files: [file],
                title: 'Echo POCUS Report',
                text: 'Attached is the generated POCUS PAH Echo Report.'
            });
        } catch (error) {
            console.error("Sharing failed", error);
            doc.save(filename); // Fallback to download
        }
    } else {
        alert("Native sharing not supported on this browser. Downloading file instead.");
        doc.save(filename);
    }
};
