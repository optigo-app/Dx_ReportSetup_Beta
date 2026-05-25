"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CirclePlus, Search, X } from "lucide-react";
import {
  Button,
  Card,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { CallApi } from "@/apiList/CallApi";
import LoadingBackdrop from "@/Utils/LoadingBackdrop";
import "./ReportList.scss";

const ReportList = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locationSearch = searchParams.toString()
    ? `?${searchParams.toString()}`
    : "";

  const [loading, setLoading] = useState(false);
  const [spList, setSpList] = useState([]);
  const [search, setSearch] = useState("");

  const clientIpAddress =
    typeof window !== "undefined"
      ? sessionStorage.getItem("clientIpAddress")
      : null;

  const getSpData = async () => {
    setLoading(true);
    const AllData =
      typeof window !== "undefined"
        ? JSON.parse(sessionStorage.getItem("reportVarible"))
        : null;
    const body = {
      con: `{"id": "", "mode": "getSpList", "appuserid": "${AllData?.LUId}","IPAddress": "${clientIpAddress}"}`,
      p: "{}",
      f: "DynamicReport ( get sp list )",
    };
    const response = await CallApi(body);
    setLoading(false);
    if (response?.rd) {
      const sortedData = response?.rd.sort((a, b) => b.ReportId - a.ReportId);
      setSpList(sortedData);
    }
  };

  useEffect(() => {
    getSpData();
  }, []);

  const filteredSpList = spList?.filter((sp) => {
    const query = search.toLowerCase();
    return (
      sp.ReportName?.toLowerCase().includes(query) ||
      sp.ReportDescription?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="SP_list_main">
      <LoadingBackdrop isLoading={loading} />
      <p style={{position: 'absolute', right:'40px', bottom: '40px', color: '#f5f6fa'}}>Version : LOCAL76.101-250520260426</p>
      {/* <p>Version : R76BETA - 25052026</p> */}
      {/* <p>Version : R76BETA - 25052026</p> */}
      <div className="spList_header">
        <p className="spList_title">Report List</p>
        <Button
          className="header_add_btn"
          onClick={() => {
            sessionStorage.removeItem("addReportSp");
            router.push(`/AddReport${locationSearch}`);
          }}
          startIcon={<CirclePlus size={18} />}
        >
          New Report
        </Button>
      </div>

      {!loading && (
        <div className="report_list_body">
          <div className="report_list_toolbar">
            <TextField
              type="text"
              placeholder="Search reports..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={16} color="#888" />
                  </InputAdornment>
                ),
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton edge="end" size="small" onClick={() => setSearch("")}>
                      <X size={16} color="#888" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
              sx={{
                width: "320px",
                "& .MuiInputBase-input": { padding: "7px 8px !important" },
                "& .MuiOutlinedInput-root": { borderRadius: "8px" },
              }}
            />
            <Typography className="report_count_label">
              {filteredSpList?.length} report{filteredSpList?.length !== 1 ? "s" : ""}
            </Typography>
          </div>

          {filteredSpList?.length === 0 ? (
            <div className="empty_state">
              <Typography className="empty_state_text">
                {search ? `No reports match "${search}"` : "No reports found. Click New Report to add one."}
              </Typography>
            </div>
          ) : (
            <div className="Report_list_flexView">
              {filteredSpList?.map((sp) => (
                <div key={sp.ReportId} className="Sp_list_singleView">
                  <div className="card_accent" />
                  <div className="card_content">
                    <Typography className="sp_list_Title">{sp.ReportName}</Typography>
                    {sp.ReportDescription && (
                      <p className="sp_list_Description">{sp.ReportDescription}</p>
                    )}
                  </div>
                  <div className="card_actions">
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => {
                        router.push(`/ShowColumnList${locationSearch}${locationSearch ? "&" : "?"}reportId=${sp.ReportId}`);
                      }}
                      className="Btn_EditSp"
                    >
                      Customize
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        sessionStorage.setItem("addReportSp", JSON.stringify({ sp }));
                        router.push(`/AddReport${locationSearch}`);
                      }}
                      className="Btn_AddColumn"
                    >
                      Add Column
                    </Button>
                    {sp?.rd && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={(e) => { e.stopPropagation(); router.push(`/NewFirstSample/${sp.id}`); }}
                        className="Btn_ShwoReport"
                      >
                        Show Report
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportList;