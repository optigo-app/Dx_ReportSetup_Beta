"use client";
// http://localhost:3000/?pid=18332

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import "./SpList.scss";
import { CirclePlus, Search, X } from "lucide-react";
import { Button, IconButton, InputAdornment, TextField } from "@mui/material";
import LoadingBackdrop from "@/Utils/LoadingBackdrop";
import { CallApi } from "@/apiList/CallApi";

const SpList = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locationSearch = searchParams.toString() ? `?${searchParams.toString()}` : "";
  const [loading, setLoading] = useState(false);
  const [spList, setSpList] = useState([]);
  const [search, setSearch] = useState("");
  const clientIpAddress = typeof window !== "undefined" ? sessionStorage.getItem("clientIpAddress") : null;

  const getSpData = async () => {
    setLoading(true);
    let AllData = JSON.parse(sessionStorage.getItem("reportVarible"));
    const body = {
      con: `{"id": "", "mode": "getSpNameList", "appuserid": "${AllData?.LUId}","IPAddress": "${clientIpAddress}"}`,
      p: "{}",
      f: "DynamicReport ( get sp list )",
    };
    const response = await CallApi(body);
    setLoading(false);
    if (response?.rd) {
      setSpList(response?.rd);
    }
  };

  useEffect(() => {
    getSpData();
  }, []);

  const filteredSpList = spList?.filter((sp) => {
    const query = search.toLowerCase();
    return sp.SpName?.toLowerCase().includes(query);
  });

  return (
    <div className="SP_list_main">
      <LoadingBackdrop isLoading={loading} />
      <div className="spList_header">
        <p className="spList_title">SP List</p>
        {/* <IconButton onClick={() => navigate("/AddSpColum")}>
          <CirclePlus style={{ color: "white" }} />
        </IconButton> */}
      </div>

      {!loading && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div
            className="sp_list_div_main"
            style={{ margin: "10px 0px", width: "1200px" }}
          >
            {spList?.length === 0 && !loading ? (
              <p style={{ textAlign: "center", color: "gray" }}>
                No SP Data found. Click + to add one.
              </p>
            ) : (
              <div style={{ width: "100%" }}>
                <Button
                  className="Sp_list_ADD_REPORT"
                  onClick={() =>
                    (() => {
                      sessionStorage.removeItem("editSpData");
                      router.push(`/AddSpColum${locationSearch}`);
                    })()
                  }
                >
                  <CirclePlus style={{ color: "rgb(86, 74, 252)" }} />
                  <p>ADD SP</p>
                </Button>
                <div style={{ marginBottom: "10px" }}>
                  <TextField
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search size={18} color="#888" />
                        </InputAdornment>
                      ),
                      endAdornment: search ? (
                        <InputAdornment position="end">
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => setSearch("")}
                            aria-label="clear"
                          >
                            <X size={18} color="#888" />
                          </IconButton>
                        </InputAdornment>
                      ) : null,
                    }}
                    sx={{
                      width: "350px",
                      "& .MuiInputBase-input": {
                        padding: "6px 8px !important",
                      },
                    }}
                    className="txt_commonSearch"
                  />
                </div>
                <div className="Sp_list_flexView">
                  {filteredSpList?.map((sp) => (
                    <div key={sp.id} className="Sp_list_singleView">
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                        }}
                      >
                        <p className="sp_list_Title">{sp.SpName}</p>
                        <p className="sp_list_Description">
                          {sp.ReportDescription}
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() =>
                            (() => {
                              sessionStorage.setItem("editSpData", JSON.stringify({ sp }));
                              router.push(`/AddSpColum${locationSearch}`);
                            })()
                          }
                          className="Btn_AddColumn"
                        >
                          Add Column
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpList;
