import { Button, FormControl, InputLabel, MenuItem, Select } from "@mui/material";

const SYMBOLS = ["(", ")", "&&", "||"];

const RightBaseFormulaBuilder = ({ master = [], value = "", onChange }) => {

    const tokens = value ? value?.split(" ").filter(Boolean) : [];

    const addToken = (token) => {
        const newTokens = [...tokens, token];
        onChange(newTokens.join(" "));
    };

    const removeLastToken = () => {
        if (!tokens.length) return;
        onChange(tokens.slice(0, -1).join(" "));
    };

    const clearAll = () => onChange("");

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {/* Formula display */}
            <div
                style={{
                    minHeight: "36px",
                    border: "1px solid var(--color-border-tertiary)",
                    borderRadius: "6px",
                    padding: "4px 8px",
                    fontSize: "13px",
                    fontFamily: "monospace",
                    background: "var(--color-background-secondary)",
                    color: "var(--color-text-primary)",
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: "4px",
                }}
            >
                {tokens?.length === 0 ? (
                    <span style={{ color: "var(--color-text-tertiary)", fontStyle: "italic", fontFamily: "inherit" }}>
                        Build formula below…
                    </span>
                ) : (
                    tokens?.map((tok, i) => {
                        const isSymbol = SYMBOLS?.includes(tok);
                        return (
                            <span
                                key={i}
                                style={{
                                    background: isSymbol ? "var(--color-background-info)" : "var(--color-background-primary)",
                                    color: isSymbol ? "var(--color-text-info)" : "var(--color-text-primary)",
                                    border: "0.5px solid var(--color-border-secondary)",
                                    borderRadius: "4px",
                                    padding: "1px 6px",
                                    fontSize: "12px",
                                    fontFamily: "monospace",
                                }}
                            >
                                {tok}
                            </span>
                        );
                    })
                )}
            </div>

            {/* Master dropdown */}
            <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                <FormControl size="small" style={{ minWidth: "180px" }}>
                    <InputLabel>Add field</InputLabel>
                    <Select
                        label="Add field"
                        value=""
                        onChange={(e) => {
                            if (e.target.value) addToken(e.target.value);
                        }}
                    >
                        <MenuItem value="">-- Select --</MenuItem>
                        {master?.map((item) => (
                            <MenuItem key={item.id} value={item.Flag_Name}>
                                {item.Flag_Name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Symbol buttons */}
                {SYMBOLS?.map((sym) => (
                    <Button
                        key={sym}
                        size="small"
                        variant="outlined"
                        onClick={() => addToken(sym)}
                        sx={{
                            minWidth: "36px",
                            px: "8px",
                            fontSize: "13px",
                            fontFamily: "monospace",
                            borderColor: "var(--color-border-secondary)",
                            color: "var(--color-text-info)",
                        }}
                    >
                        {sym}
                    </Button>
                ))}

                {/* Backspace */}
                <Button
                    size="small"
                    onClick={removeLastToken}
                    disabled={!tokens.length}
                    sx={{ fontSize: "12px", color: "var(--color-text-secondary)" }}
                >
                    ← Undo
                </Button>

                {/* Clear */}
                <Button
                    size="small"
                    onClick={clearAll}
                    disabled={!tokens.length}
                    sx={{ fontSize: "12px", color: "var(--color-text-danger)" }}
                >
                    Clear
                </Button>
            </div>
        </div>
    );
};
export default RightBaseFormulaBuilder;
