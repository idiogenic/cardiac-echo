/**
 * v22.0 Exhaustive PDF Generator - AU Format & High Fidelity
 * Permanent Instruction: No Truncation, No Abbreviation.
 */

window.generateAndSharePDF = async function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const form = document.getElementById('pah-form');
    const fd = new FormData(form);

    let y = 15;
    const margin = 20;
    const col2 = 105; // Midpoint for 2-column layout
    const maxW = 170; // Max width for text wrapping
    const lineH = 6;

    // --- Helpers ---
    const checkPageBreak = (needed) => {
        if (y + needed > 280) {
            doc.addPage();
            y = 15;
        }
    };

    const drawSuperHeader = (title) => {
        checkPageBreak(15);
        doc.setFillColor(233, 236, 239);
        doc.rect(margin, y, 170, 8, 'F');
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(0);
        doc.text(title.toUpperCase(), margin + 2, y + 6);
        y += 13;
    };

    const drawSubHeader = (title) => {
        checkPageBreak(10);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text(title, margin, y);
        y += 2;
        doc.setLineWidth(0.1);
        doc.line(margin, y, 190, y);
        y += 6;
        doc.setFont("helvetica", "normal");
    };

    const formatAUDate = (dateStr) => {
        if (!dateStr) return "____/____/____";
        const parts = dateStr.split('-'); // YYYY-MM-DD
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    };

    const addField = (label, value, xPos = margin, wrap = false) => {
        if (!value || value === "Not Assessed" || value === "") return false;
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        
        if (wrap) {
            const text = `${label}: ${value}`;
            const splitText = doc.splitTextToSize(text, maxW);
            doc.text(splitText, xPos, y);
            y += (splitText.length * 4.5);
        } else {
            doc.text(`${label}:`, xPos, y);
            doc.setFont("helvetica", "bold");
            doc.text(`${value}`, xPos + doc.getTextWidth(`${label}: `), y);
        }
        return true;
    };

    // --- 1. HEADER ---
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("POCUS PAH CARDIAC ECHO REPORT", margin, y);
    y += 10;

    // --- 2. PATIENT INFORMATION (Demographics) ---
    drawSuperHeader("Patient Information");
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Patient Name / DOB: ________________________________________________", margin, y);
    y += 8;
    doc.text("MRN: ____________________________________", margin, y);
    y += 8;
    
    addField("Operator", fd.get('operator'));
    addField("Exam Date (AU)", formatAUDate(fd.get('exam_date')), col2);
    y += lineH;
    
    // Wrapped demographics
    addField("Medical History", fd.get('med_history'), margin, true);
    addField("Haemo Therapy", fd.get('haemo_therapy'), margin, true);
    
    const v1 = addField("Ventilation", fd.get('ventilation'));
    const v2 = addField("Image Quality", fd.get('img_quality'), col2);
    if (v1 || v2) y += lineH;

    // --- 3. CLINICAL QUESTION ---
    drawSuperHeader("Clinical Question");
    const cq = fd.getAll('cq');
    if (cq.length > 0) {
        addField("Reason for Scan", cq.join(", "), margin, true);
    } else {
        doc.text("No specific clinical question selected.", margin, y);
        y += lineH;
    }

    // --- 4. EXAMINATION ---
    drawSuperHeader("Examination");

    // PLAX LV
    drawSubHeader("Parasternal Long-Axis View (LV)");
    addField("Effusion", fd.get('plax_eff'));
    addField("LV End-Diastolic Diam", fd.get('plax_lv_edd'), col2);
    y += lineH;
    addField("Mitral Regurg", fd.get('plax_mr'));
    addField("Vena Contracta (MV)", fd.get('plax_mr_vc'), col2);
    y += lineH;
    addField("Aortic Regurg", fd.get('plax_ar'));
    addField("Vena Contracta (AV)", fd.get('plax_ar_vc'), col2);
    y += lineH;
    addField("Jet-width:LVOT", fd.get('plax_ar_jw_lvot'));
    addField("LVOT Diameter", fd.get('plax_lvot_d') ? fd.get('plax_lvot_d') + " cm" : "", col2);
    y += lineH;
    addField("AV Leaflets", fd.get('plax_av_leaflets'));
    addField("MACS", fd.get('plax_av_macs'), col2);
    y += lineH + 2;

    // PLAX RV
    drawSubHeader("Parasternal Long-Axis View (RV Inflow)");
    addField("Tricuspid Regurg", fd.get('plax_tr'));
    y += lineH;
    addField("TR Jet Velocity", fd.get('plax_tr_vel') ? fd.get('plax_tr_vel') + " m/s" : "");
    addField("Calculated RVSP", fd.get('plax_rvsp') ? fd.get('plax_rvsp') + " mmHg" : "", col2);
    y += lineH + 2;

    // PSAX Aortic
    drawSubHeader("Parasternal Short-Axis View (Aortic)");
    addField("AV Trileaflet", fd.get('psax_av_tri'));
    addField("Tricuspid Regurg", fd.get('psax_tr'), col2);
    y += lineH;
    addField("TR Velocity", fd.get('psax_tr_vel') ? fd.get('psax_tr_vel') + " m/s" : "");
    addField("Calculated RVSP", fd.get('psax_rvsp_aor') ? fd.get('psax_rvsp_aor') + " mmHg" : "", col2);
    y += lineH + 2;

    // PSAX Mid-Papillary
    drawSubHeader("Parasternal Short-Axis View (Mid-Papillary)");
    addField("RV Septal Flattening", fd.get('psax_septum'));
    addField("LV Systolic Collapse", fd.get('psax_lv_collapse'), col2);
    y += lineH;
    addField("RWMA Present", fd.get('psax_rwma_present'));
    y += lineH;

    // RWMA 17-SEGMENT GRID MAPPING
    if (fd.get('psax_rwma_present') === "Yes") {
        doc.setFont("helvetica", "bold");
        doc.text("17-Segment Analysis:", margin, y);
        y += 5;
        doc.setFont("helvetica", "normal");
        const segments = ["Basal Anterior (LAD)", "Basal Anteroseptal (LAD)", "Basal Inferoseptal (RCA)", "Basal Inferior (RCA)", "Basal Inferolateral (LCX)", "Basal Anterolateral (LCX)", "Mid Anterior (LAD)", "Mid Anteroseptal (LAD)", "Mid Inferoseptal (RCA)", "Mid Inferior (RCA)", "Mid Inferolateral (LCX)", "Mid Anterolateral (LCX)", "Apical Anterior (LAD)", "Apical Septal (LAD)", "Apical Inferior (RCA)", "Apical Lateral (LCX)", "Apex"];
        let count = 0;
        segments.forEach((name, i) => {
            const val = fd.get(`seg_${i}`);
            if (val && val !== "Normal") {
                const x = (count % 2 === 0) ? margin + 5 : col2;
                doc.text(`• ${name}: ${val}`, x, y);
                if (count % 2 !== 0) y += 4;
                count++;
            }
        });
        if (count % 2 !== 0) y += 5;
        else y += 2;
    }

    // Apical Views
    drawSubHeader("Apical View Mapping");
    addField("Mitral Regurg", fd.get('ap_mr'));
    addField("MV Vena Contracta", fd.get('ap_mr_vc'), col2);
    y += lineH;
    addField("Aortic Regurg", fd.get('ap_ar'));
    addField("AV Vena Contracta", fd.get('ap_ar_vc'), col2);
    y += lineH;
    addField("Jet-width:LVOT", fd.get('ap_ar_jw_lvot'));
    addField("LVOT VTI", fd.get('ap_lvot_vti') ? fd.get('ap_lvot_vti') + " cm" : "", col2);
    y += lineH;
    addField("TAPSE Category", fd.get('ap_tapse_select'));
    addField("TAPSE Value", fd.get('ap_tapse_val') ? fd.get('ap_tapse_val') + " mm" : "", col2);
    y += lineH;
    addField("AV Mean Gradient", fd.get('ap_av_mpg'));
    addField("MV Mean Gradient", fd.get('ap_mv_mpg'), col2);
    y += lineH;
    addField("RV Size Ratio", fd.get('ap_rv_size_ratio'));
    addField("RV Basal Diam", fd.get('ap_rv_basal'), col2);
    y += lineH;
    addField("RV Mid Diam", fd.get('ap_rv_mid'));
    addField("RV Major Axis", fd.get('ap_rv_major'), col2);
    y += lineH;
    addField("RV FAC", fd.get('ap_rv_fac'));
    addField("LV EF", fd.get('ap_lv_ef'), col2);
    y += lineH + 2;

    // Subcostal
    drawSubHeader("Subcostal View");
    addField("Pericardial Effusion", fd.get('sub_eff'));
    addField("IVC Diameter", fd.get('sub_ivc_d'), col2);
    y += lineH;
    addField("IVC Sniff Variation", fd.get('sub_ivc_v'));
    y += lineH + 2;

    // --- 5. SUMMARY ---
    drawSuperHeader("Summary Findings");
    
    // Left Chambers
    drawSubHeader("Left Chambers");
    addField("LV Size", fd.get('sum_lv_size'));
    addField("LV Systolic Function", fd.get('sum_lv_func'), col2);
    y += lineH;
    addField("Wall Motion", fd.get('sum_lv_rwma'));
    y += lineH;

    // Right Chambers
    drawSubHeader("Right Chambers");
    addField("RV Size", fd.get('sum_rv_size'));
    addField("RV Function", fd.get('sum_rv_func'), col2);
    y += lineH;
    addField("TAPSE Summary", fd.get('sum_tapse'));
    addField("RVSP Summary", fd.get('sum_rvsp'), col2);
    y += lineH;
    addField("Septum Summary", fd.get('sum_septum'));
    y += lineH;

    // Pericardium & Valves
    drawSubHeader("Pericardium & Valves");
    addField("Pericardium Summary", fd.get('sum_pericardium'), margin, true);
    addField("Tricuspid Valve", fd.get('sum_v_tri'));
    addField("Mitral Valve", fd.get('sum_v_mit'), col2);
    y += lineH;
    addField("Aortic Valve", fd.get('sum_v_aor'));
    y += lineH + 2;

    // Final Assessment
    drawSubHeader("Final Assessment");
    const states = fd.getAll('sum_haemo');
    if (states.length > 0) {
        addField("Haemodynamic State", states.join(", "), margin, true);
    }
    y += 2;
    addField("Comments", fd.get('general_comments'), margin, true);

    // --- SHARE LOGIC ---
    const pdfBlob = doc.output('blob');
    const fileName = `Echo_Report_${formatAUDate(fd.get('exam_date')).replace(/\//g, '-')}.pdf`;
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
        alert("Native share sheet not available. PDF downloaded to device.");
    }
};
