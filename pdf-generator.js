/**
 * v20.1 PDF Generator - High Fidelity Layout
 * Replicates the original PDF structure with Super-Sectioning.
 */

window.generateAndSharePDF = async function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const form = document.getElementById('pah-form');
    const fd = new FormData(form);

    let y = 15;
    const margin = 20;
    const pageWidth = 210;
    const col2 = 110;

    const checkPageBreak = (needed) => {
        if (y + needed > 280) {
            doc.addPage();
            y = 15;
        }
    };

    const drawSuperHeader = (title) => {
        checkPageBreak(15);
        doc.setFillColor(233, 236, 239); // Match app --super-section-bg
        doc.rect(margin, y, 170, 8, 'F');
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(0);
        doc.text(title.toUpperCase(), margin + 2, y + 6);
        y += 12;
    };

    const drawSubHeader = (title) => {
        checkPageBreak(10);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text(title, margin, y);
        y += 5;
        doc.setLineWidth(0.1);
        doc.line(margin, y, 190, y);
        y += 6;
        doc.setFont("helvetica", "normal");
    };

    const addDataLine = (label, value, xPos = margin) => {
        if (!value || value === "Not Assessed" || value === "") return;
        doc.setFontSize(8);
        doc.text(`${label}:`, xPos, y);
        doc.setFont("helvetica", "bold");
        doc.text(`${value}`, xPos + doc.getTextWidth(`${label}: `), y);
        doc.setFont("helvetica", "normal");
    };

    // --- 1. HEADER & SECURITY FIELDS ---
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("POCUS PAH CARDIAC ECHO REPORT", margin, y);
    y += 10;

    drawSuperHeader("Patient Information");
    doc.setFontSize(9);
    doc.text("Patient Name / DOB: ___________________________________", margin, y);
    y += 8;
    doc.text("MRN: _______________________", margin, y);
    doc.text(`Exam Date: ${fd.get('exam_date') || '____/____/____'}`, col2, y);
    y += 8;
    addDataLine("Operator", fd.get('operator'));
    y += 6;

    // --- 2. CLINICAL QUESTION ---
    drawSuperHeader("Clinical Question");
    const cq = Array.from(form.querySelectorAll('input[name="cq"]:checked')).map(cb => cb.value);
    if (cq.length > 0) {
        doc.setFontSize(8);
        doc.text(cq.join(", "), margin, y, { maxWidth: 170 });
        y += (Math.ceil(cq.join(", ").length / 80) * 5);
    } else {
        doc.text("No specific clinical question selected.", margin, y);
        y += 6;
    }

    // --- 3. EXAMINATION (ECHO VIEWS) ---
    drawSuperHeader("Examination");

    // PLAX Section
    drawSubHeader("Parasternal Long-Axis View (LV & RV Inflow)");
    addDataLine("Effusion", fd.get('plax_eff'));
    addDataLine("LVEDD", fd.get('plax_lv_edd'), col2);
    y += 5;
    addDataLine("MV Regurg", fd.get('plax_mr'));
    addDataLine("MV VC", fd.get('plax_mr_vc'), col2);
    y += 5;
    addDataLine("AV Regurg", fd.get('plax_ar'));
    addDataLine("AV VC", fd.get('plax_ar_vc'), col2);
    y += 5;
    addDataLine("LVOT Diam", fd.get('plax_lv_lvot_d') + " cm");
    addDataLine("RVSP", fd.get('plax_rvsp') + " mmHg", col2);
    y += 8;

    // PSAX Section
    drawSubHeader("Parasternal Short-Axis View (AV & Mid-Pap)");
    addDataLine("AV Trileaflet", fd.get('psax_av_tri'));
    addDataLine("RV Septum", fd.get('psax_septum'), col2);
    y += 5;
    addDataLine("LV Collapse", fd.get('psax_lv_collapse'));
    addDataLine("RWMA", fd.get('psax_rwma_present'), col2);
    y += 8;

    // Apical Section
    drawSubHeader("Apical Views");
    addDataLine("TAPSE", `${fd.get('ap_tapse_select')} (${fd.get('ap_tapse_val')} mm)`);
    addDataLine("RV FAC", fd.get('ap_rv_fac'), col2);
    y += 5;
    addDataLine("LV EF", fd.get('ap_lv_ef'));
    addDataLine("LVOT VTI", fd.get('ap_lvot_vti') + " cm", col2);
    y += 8;

    // Subcostal Section
    drawSubHeader("Subcostal View & IVC");
    addDataLine("Pericard. Effusion", fd.get('sub_eff'));
    addDataLine("IVC Diameter", fd.get('sub_ivc_d'), col2);
    y += 5;
    addDataLine("IVC Variation", fd.get('sub_ivc_v'));
    y += 10;

    // --- 4. SUMMARY FINDINGS ---
    drawSuperHeader("Summary Findings");
    
    const addSummaryRow = (label, value) => {
        if (!value || value === "Not Assessed") return;
        checkPageBreak(6);
        doc.setFont("helvetica", "bold");
        doc.text(label + ":", margin, y);
        doc.setFont("helvetica", "normal");
        doc.text(value, margin + 40, y);
        y += 6;
    };

    addSummaryRow("LV Size/Function", `${fd.get('sum_lv_size')} / ${fd.get('sum_lv_func')}`);
    addSummaryRow("RV Size/Function", `${fd.get('sum_rv_size')} / ${fd.get('sum_rv_func')}`);
    addSummaryRow("Valvulopathy", `Mitral: ${fd.get('sum_v_mit')} | Aortic: ${fd.get('sum_v_aor')}`);
    
    const haemo = Array.from(form.querySelectorAll('input[name="sum_haemo"]:checked')).map(cb => cb.value);
    if (haemo.length > 0) addSummaryRow("Primary State", haemo.join(", "));

    y += 4;
    checkPageBreak(20);
    doc.setFont("helvetica", "bold");
    doc.text("General Comments:", margin, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    const comments = fd.get('general_comments') || "None recorded.";
    const splitComments = doc.splitTextToSize(comments, 170);
    doc.text(splitComments, margin, y);

    // SHARE LOGIC
    const pdfBlob = doc.output('blob');
    const fileName = `Echo_Report_${fd.get('exam_date') || 'Export'}.pdf`;
    const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
            await navigator.share({
                files: [file],
                title: 'Echo Report',
                text: 'POCUS PAH Cardiac Echo Report'
            });
        } catch (err) { if (err.name !== "AbortError") doc.save(fileName); }
    } else {
        doc.save(fileName);
    }
};
