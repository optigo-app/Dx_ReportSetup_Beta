import { Box, Button, Checkbox, FormControl, IconButton, InputLabel, MenuItem, Select, Tooltip, Typography } from '@mui/material';
import { Eye, X } from 'lucide-react';

const ChartViewDrawer = ({
    spData,
    setChartViewData,
    setChartDrawerOpen,
    chartViewData,
    setPreviewOpen,
    setOpenChartType
}) => {
    const handleChartCheckboxChange = (index) => {
        setChartViewData((prev) =>
            prev.map((chart, i) => {
                if (i !== index) return chart;
                const nowEnabled = !chart.enabled;
                return {
                    ...chart,
                    enabled: nowEnabled,
                    ...(nowEnabled ? {} : chart.type === "PieChart"
                        ? { PieDataColumn: "" }
                        : { xAxisColumn: "", yAxisColumn: "" }),
                };
            })
        );
    };


    const handleChartSelectChange = (index, field, value) => {
        setChartViewData((prev) =>
            prev.map((chart, i) => (i === index ? { ...chart, [field]: value } : chart))
        );
    };

    const handleChartDrawerSave = () => {
        setChartDrawerOpen(false);
    };

    return (
        <>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 20px 10px",
                    borderBottom: "1px solid #e0e0e0",
                    flexShrink: 0,
                }}
            >
                <Typography variant="h6" style={{ fontWeight: 600, fontSize: "16px", color: "#333" }}>
                    Chart View Settings
                </Typography>
                <IconButton size="small" onClick={() => setChartDrawerOpen(false)}>
                    <X size={18} />
                </IconButton>
            </Box>

            <Box sx={{ overflowY: "auto", flex: 1, padding: "16px 20px" }}>
                <div className="chart_view_settig_div">
                    {chartViewData.map((chart, index) => (
                        <div
                            key={chart.type}
                            className="chart_item"
                            style={{
                                border: `1px solid ${chart.enabled ? "rgb(86,74,252)" : "#e0e0e0"}`,
                                borderRadius: "8px",
                                padding: "10px 14px",
                                marginBottom: "10px",
                                background: chart.enabled ? "rgba(86,74,252,0.04)" : "#fafafa",
                                transition: "all 0.2s ease",
                            }}
                        >
                            {/* Chart row header */}
                            <div className="chart_header" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <Checkbox
                                    checked={chart.enabled}
                                    onChange={() => handleChartCheckboxChange(index)}
                                    style={{ padding: "4px" }}
                                    sx={{
                                        color: "rgb(86,74,252)",
                                        "&.Mui-checked": { color: "rgb(86,74,252)" },
                                    }}
                                />
                                <span style={{ width: "110px", fontWeight: chart.enabled ? 600 : 400, fontSize: "14px" }}>
                                    {chart.type}
                                </span>
                                <Tooltip title="Show Preview">
                                    <IconButton
                                        size="small"
                                        onClick={() => { setPreviewOpen(true); setOpenChartType(chart.type); }}
                                    >
                                        <Eye size={16} />
                                    </IconButton>
                                </Tooltip>
                            </div>

                            {/* Dropdowns — shown when enabled */}
                            {chart.enabled && (
                                <div
                                    className="chart_fields"
                                    style={{ display: "flex", gap: "12px", marginTop: "10px", flexWrap: "wrap" }}
                                >
                                    {chart.type === "PieChart" ? (
                                        <FormControl size="small" style={{ minWidth: "200px", flex: 1 }}>
                                            <InputLabel id={`pie-label-${index}`}>Pie Data Column</InputLabel>
                                            <Select
                                                labelId={`pie-label-${index}`}
                                                label="Pie Data Column"
                                                value={chart.PieDataColumn || ""}
                                                onChange={(e) => handleChartSelectChange(index, "PieDataColumn", e.target.value)}
                                            >
                                                <MenuItem value="">— Select —</MenuItem>
                                                {spData?.result?.map((col) => (
                                                    <MenuItem key={col.ColId} value={col.FieldName}>
                                                        {col.HeaderName}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    ) : (
                                        <>
                                            <FormControl size="small" style={{ minWidth: "180px", flex: 1 }}>
                                                <InputLabel id={`xaxis-label-${index}`}>X Axis</InputLabel>
                                                <Select
                                                    labelId={`xaxis-label-${index}`}
                                                    label="X Axis"
                                                    value={chart.xAxisColumn || ""}
                                                    onChange={(e) => handleChartSelectChange(index, "xAxisColumn", e.target.value)}
                                                >
                                                    <MenuItem value="">— Select X Axis —</MenuItem>
                                                    {spData?.result?.map((col) => (
                                                        <MenuItem key={col.ColId} value={col.FieldName}>
                                                            {col.HeaderName}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                            <FormControl size="small" style={{ minWidth: "180px", flex: 1 }}>
                                                <InputLabel id={`yaxis-label-${index}`}>Y Axis</InputLabel>
                                                <Select
                                                    labelId={`yaxis-label-${index}`}
                                                    label="Y Axis"
                                                    value={chart.yAxisColumn || ""}
                                                    onChange={(e) => handleChartSelectChange(index, "yAxisColumn", e.target.value)}
                                                >
                                                    <MenuItem value="">— Select Y Axis —</MenuItem>
                                                    {spData?.result?.map((col) => (
                                                        <MenuItem key={col.ColId} value={col.FieldName}>
                                                            {col.HeaderName}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </Box>

            <Box
                sx={{
                    padding: "12px 20px",
                    borderTop: "1px solid #e0e0e0",
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "12px",
                    flexShrink: 0,
                    background: "#fff",
                }}
            >
                <Button
                    variant="outlined"
                    onClick={() => setChartDrawerOpen(false)}
                    style={{ color: "#666", borderColor: "#ccc", textTransform: "none" }}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleChartDrawerSave}
                    style={{
                        backgroundColor: "rgb(86, 74, 252)",
                        color: "white",
                        textTransform: "none",
                        fontWeight: 600,
                    }}
                >
                    Save
                </Button>
            </Box>
        </>
    )
}

export default ChartViewDrawer
