"use client";

import React, { useEffect, useState } from "react";
import {
  TextField,
  Box,
  FormControlLabel,
  Checkbox,
  Popover,
  IconButton,
} from "@mui/material";
import { ChromePicker } from "react-color";

const ColorPickerInput = ({ label, value, onChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpenPicker = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePicker = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
      <p style={{ margin: "0px" }}>{label}</p>
      <TextField
        value={value}
        onChange={(e) => onChange(e.target.value)}
        fullWidth
        InputProps={{
          endAdornment: (
            <IconButton onClick={handleOpenPicker} sx={{ p: 0.5 }}>
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  backgroundColor: value || "#ffffff",
                  border: "1px solid #ccc",
                }}
              />
            </IconButton>
          ),
        }}
        className="customize_colum_input"
      />

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClosePicker}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <ChromePicker
          color={value || "#ffffff"}
          onChange={(color) => onChange(color.hex)}
        />
      </Popover>
    </Box>
  );
};

const ColorPickerPanel = ({ value = {}, onChange }) => {
  const [enableColors, setEnableColors] = useState(
    Object.values(value).some((v) => v !== false && v !== null)
  );

  const handleColorChange = (field) => (val) => {
    onChange({ ...value, [field]: val });
  };

  useEffect(() => {
    setEnableColors(!!value.IsPositiveNagativeColor);
  }, [value.IsPositiveNagativeColor]);

  return (
    <Box>
      <FormControlLabel
        control={
          <Checkbox
            checked={!!value.IsPositiveNagativeColor}
            onChange={(e) =>
              onChange({
                ...value,
                IsPositiveNagativeColor: e.target.checked ? 1 : 0,
              })
            }
          />
        }
        label="PositiveNegativeColor"
      />

      {enableColors && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <div style={{ display: "flex", gap: "20px" }}>
            <div>
              <ColorPickerInput
                label="Position Font Color"
                value={value.PvFColor || "#000000"}
                onChange={handleColorChange("PvFColor")}
              />
              <p style={{ margin: "0px", fontSize: "12px", color: "#b2a9a9" }}>
                Ex :- #28c76f
              </p>
            </div>
            <div>
              <ColorPickerInput
                label="Positive Background Color"
                value={value.PvBgColor || "#00ff00"}
                onChange={handleColorChange("PvBgColor")}
              />
              <p style={{ margin: "0px", fontSize: "12px", color: "#b2a9a9" }}>
                Ex :- #dcf6e8
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "20px" }}>
            <div>
              <ColorPickerInput
                label="Negative Font Color"
                value={value.NvFColor || "#ff0000"}
                onChange={handleColorChange("NvFColor")}
              />
              <p style={{ margin: "0px", fontSize: "12px", color: "#b2a9a9" }}>
                Ex :- #ff4c51
              </p>
            </div>
            <div>
              <ColorPickerInput
                label="Negative Background Color"
                value={value.NvBgColor || "#ffff00"}
                onChange={handleColorChange("NvBgColor")}
              />
              <p style={{ margin: "0px", fontSize: "12px", color: "#b2a9a9" }}>
                Ex :- #ffe2e3
              </p>
            </div>
          </div>
        </Box>
      )}
    </Box>
  );
};

export default ColorPickerPanel;