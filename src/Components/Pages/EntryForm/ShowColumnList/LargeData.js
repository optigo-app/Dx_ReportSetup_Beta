import { Button, Checkbox, Grid, TextField, Typography } from '@mui/material';

const LargeData = ({
    selectedCols,
    handleCheckboxChange,
    largestLength,
    handleDateOptionChange,
    setLargestLength,
    spliterMonthCont,
    setSpliterMonthCont,
    largeDataColum,
    spliterFirst,
    setLargeDataColum,
    handleSecondSelect,
    handleFirstSelect,
    spliterSecond,
    handleOpen,
    allDateOptionsShow,
    handleToggleFilterOption,
    allDateOptions,
    selectedDateOptions
}) => {
    return (
        <div className="showList_LargeMain" style={{
            width: selectedCols.includes("Spliter Report") && "15%"
        }}>
            <div className="LargeData_Report">
                <div style={{ display: "flex", alignItems: "center" }}>
                    <Checkbox
                        checked={selectedCols.includes("Largest Data Report")}
                        onChange={() =>
                            handleCheckboxChange("Largest Data Report")
                        }
                    />
                    <Typography className="column_label">
                        Largest Data Report
                    </Typography>

                    {selectedCols?.includes("Largest Data Report") && (
                        <Grid item xs={12} md={6}>
                            <TextField
                                type="number"
                                label="Enter Length"
                                fullWidth
                                size="small"
                                value={largestLength}
                                onChange={(e) => setLargestLength(e.target.value)}
                                style={{ margin: "0px 15px" }}
                            />
                        </Grid>
                    )}
                </div>
                {selectedCols?.includes("Largest Data Report") && (
                    <div>
                        <p
                            style={{
                                margin: "10px 0px 0px 13px",
                                fontWeight: 600,
                            }}
                            className="descLine_showColum"
                        >
                            Select For Master Selectin
                        </p>
                        <div className="largest_columns_group">
                            {largeDataColum?.map((col) => (
                                <div
                                    key={`ldr-${col.ColId}`}
                                    className="column_row sub_row"
                                    style={{ display: "flex", alignItems: "center" }}
                                >
                                    <Checkbox
                                        checked={col.IsLargeDataGroup}
                                        onChange={(e) => {
                                            setLargeDataColum((prev) =>
                                                prev.map((c) =>
                                                    c.ColId === col.ColId
                                                        ? {
                                                            ...c,
                                                            IsLargeDataGroup: e.target.checked,
                                                        }
                                                        : c
                                                )
                                            );
                                        }}
                                    />
                                    <Typography className="column_label">
                                        {col.HeaderName}
                                    </Typography>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {selectedCols?.includes("Largest Data Report") && (
                <div className="LargeData_Report_DateSection">
                    <div style={{ display: 'flex', gap: '50px' }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <Checkbox
                                checked={allDateOptionsShow}
                                onChange={handleToggleFilterOption}
                            />
                            <Typography className="column_label">
                                Filter Page Date Option
                            </Typography>
                        </div>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <Checkbox
                                checked={selectedCols.includes("Filter Page Multi Date Option")}
                                onChange={() =>
                                    handleCheckboxChange("Filter Page Multi Date Option")
                                }
                            />
                            <Typography className="column_label">
                                Filter Page Multi Date Option
                            </Typography>
                        </div>
                    </div>
                    {allDateOptionsShow && (
                        <div>
                            <p
                                style={{
                                    margin: "10px 0px 0px 13px",
                                    fontWeight: 600,
                                }}
                                className="descLine_showColum"
                            >
                                Select For Date Selectin
                            </p>
                            <div className="largest_columns_group">
                                {allDateOptions?.map((col) => (
                                    <div
                                        key={`ldr-${col.DateFrameId}`}
                                        className="column_row sub_row"
                                        style={{ display: "flex", alignItems: "center" }}
                                    >
                                        <Checkbox
                                            checked={selectedDateOptions.includes(
                                                col.DateFrameId
                                            )}
                                            onChange={() =>
                                                handleDateOptionChange(col.DateFrameId)
                                            }
                                        />
                                        <Typography className="column_label">
                                            {col.DateFrame}
                                        </Typography>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default LargeData

