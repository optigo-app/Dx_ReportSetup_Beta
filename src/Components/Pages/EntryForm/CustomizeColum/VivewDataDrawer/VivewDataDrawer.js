import React, { useState, useMemo, useEffect } from "react";
import { Box, Button, IconButton, Typography } from "@mui/material";
import { X, Plus, Trash2 } from "lucide-react";

const createRowFromCol = (col, order) => ({
    RefColId: col.ColId,
    FieldName: col.FieldName,
    Label: "",
    DisplayOrder: String(order),
});

const VivewDataDrawer = ({ allColumData = [], onClose, onSave, formData }) => {
    const [rows, setRows] = useState([]);

    useEffect(() => {
        const raw = formData?.ViewButtonDataArray;
        if (!raw) {
            setRows([]);
            return;
        }
        try {
            const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
            if (!Array.isArray(parsed)) return;
            setRows(parsed.map((item, index) => ({
                RefColId: item.RefColId,
                FieldName: item.FieldName,
                Label: item.Label || "",
                DisplayOrder: item.DisplayOrder || String(index + 1),
            })));
        } catch (err) {
            console.error("Invalid ViewButtonDataArray", err);
        }
    }, [formData?.ViewButtonDataArray]);

    const addedIds = useMemo(() => rows.map((r) => r.RefColId), [rows]);

    const handleChipClick = (col) => {
        if (addedIds.includes(col.ColId)) return;
        setRows((prev) => [...prev, createRowFromCol(col, prev.length + 1)]);
    };

    const handleRemove = (index) => {
        setRows((prev) => {
            const updated = prev.filter((_, i) => i !== index);
            return updated.map((r, i) => ({ ...r, DisplayOrder: String(i + 1) }));
        });
    };

    const handleChange = (index, field, value) => {
        setRows((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const handleAddBlank = () => {
        const unused = allColumData.find((c) => !addedIds.includes(c.ColId));
        if (unused) {
            setRows((prev) => [...prev, createRowFromCol(unused, prev.length + 1)]);
        }
    };

    const handleSave = () => {
        const ViewButtonDataArray = rows.map(({ RefColId, Label, DisplayOrder }) => ({
            RefColId,
            Label,
            DisplayOrder,
        }));
        if (onSave) onSave(ViewButtonDataArray);
        if (onClose) onClose();
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%", background: "#f7f7fb" }}>
            {/* Header */}
            <Box sx={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 16px", background: "#fff", borderBottom: "1px solid #eee", flexShrink: 0
            }}>
                <Typography sx={{ fontSize: "14px", fontWeight: 700 }}>View Data Settings</Typography>
                <IconButton size="small" onClick={onClose}><X size={16} /></IconButton>
            </Box>

            {/* ── Available Columns (chip row at top) ── */}
            <Box sx={{ padding: "10px 16px", background: "#f0f0fc", borderBottom: "1px solid #eee", flexShrink: 0 }}>
                <Typography sx={{ fontSize: "11px", fontWeight: 600, color: "#888", mb: "8px", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                    Available columns — click to add
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {allColumData.map((col) => {
                        const isAdded = addedIds.includes(col.ColId);
                        return (
                            <Box
                                key={col.ColId}
                                onClick={() => handleChipClick(col)}
                                sx={{
                                    display: "flex", alignItems: "center", gap: "5px",
                                    padding: "4px 10px", borderRadius: "99px", fontSize: "12px",
                                    cursor: isAdded ? "default" : "pointer",
                                    border: `1px solid ${isAdded ? "#a9a3ec" : "#ddd"}`,
                                    background: isAdded ? "#eeedfe" : "#fff",
                                    color: isAdded ? "#3c3489" : "#555",
                                    transition: "0.15s",
                                    "&:hover": !isAdded ? { borderColor: "#766ef3", color: "#534ab7" } : {},
                                }}
                            >
                                {isAdded ? "✓" : "+"} {col.FieldName}
                            </Box>
                        );
                    })}
                </Box>
            </Box>

            {/* Scrollable rows */}
            <Box sx={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                {rows.length === 0 ? (
                    <Box sx={{
                        display: "flex", flexDirection: "column", alignItems: "center",
                        justifyContent: "center", height: "140px", color: "#aaa", gap: "6px"
                    }}>
                        <Typography sx={{ fontSize: "13px" }}>No rows yet.</Typography>
                        <Typography sx={{ fontSize: "11px" }}>Click a column above to add it.</Typography>
                    </Box>
                ) : (
                    rows.map((row, index) => (
                        <Box key={index} sx={{
                            background: "#fff", border: "1px solid #eaeaea",
                            borderRadius: "10px", padding: "12px", position: "relative"
                        }}>
                            {/* Badge + delete */}
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "10px" }}>
                                <Box sx={{
                                    width: 22, height: 22, borderRadius: "50%", background: "rgb(86,74,252)",
                                    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "11px", fontWeight: 700
                                }}>
                                    {index + 1}
                                </Box>
                                <IconButton size="small" onClick={() => handleRemove(index)}
                                    sx={{ color: "#e53935", "&:hover": { background: "#fdecea" }, padding: "3px" }}>
                                    <Trash2 size={14} />
                                </IconButton>
                            </Box>

                            {/* Fields */}
                            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px", gap: "10px" }}>
                                {/* Label */}
                                <Box>
                                    <Typography sx={{ fontSize: "11px", color: "#888", mb: "3px" }}>Label</Typography>
                                    <input
                                        style={{
                                            width: "100%", padding: "5px 8px", fontSize: "12px",
                                            border: "1px solid #ddd", borderRadius: "6px", outline: "none"
                                        }}
                                        placeholder="e.g. Email Address"
                                        value={row.Label}
                                        onChange={(e) => handleChange(index, "Label", e.target.value)}
                                    />
                                </Box>

                                {/* FieldName — read-only pill */}
                                <Box>
                                    <Typography sx={{ fontSize: "11px", color: "#888", mb: "3px" }}>Field name</Typography>
                                    <Box sx={{
                                        padding: "5px 8px", fontSize: "12px", background: "#eeedfe",
                                        border: "1px solid #a9a3ec", borderRadius: "6px", color: "#3c3489", fontWeight: 600
                                    }}>
                                        {row.FieldName}
                                    </Box>
                                </Box>

                                {/* DisplayOrder */}
                                <Box>
                                    <Typography sx={{ fontSize: "11px", color: "#888", mb: "3px" }}>Order</Typography>
                                    <input
                                        type="number" min="1"
                                        style={{
                                            width: "100%", padding: "5px 8px", fontSize: "12px",
                                            border: "1px solid #ddd", borderRadius: "6px", outline: "none"
                                        }}
                                        value={row.DisplayOrder}
                                        onChange={(e) => handleChange(index, "DisplayOrder", e.target.value)}
                                    />
                                </Box>
                            </Box>
                        </Box>
                    ))
                )}
            </Box>

            {/* Footer */}
            <Box sx={{
                flexShrink: 0, padding: "12px 16px", background: "#fff",
                borderTop: "1px solid #eee", display: "flex", gap: "10px"
            }}>
                <Button fullWidth variant="outlined" size="small" startIcon={<Plus size={14} />}
                    onClick={handleAddBlank}
                    sx={{
                        fontSize: "12px", textTransform: "none", borderColor: "rgb(86,74,252)",
                        color: "rgb(86,74,252)", borderRadius: "7px", fontWeight: 600
                    }}>
                    Add row
                </Button>
                <Button fullWidth variant="contained" size="small" onClick={handleSave}
                    sx={{
                        fontSize: "12px", textTransform: "none", background: "rgb(86,74,252)",
                        borderRadius: "7px", fontWeight: 600, boxShadow: "none"
                    }}>
                    Save
                </Button>
            </Box>
        </Box>
    );
};

export default VivewDataDrawer;