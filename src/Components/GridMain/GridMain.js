"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Box, CircularProgress, Paper, Typography } from "@mui/material";
import axios from "axios";
import { AlertTriangle } from "lucide-react";
import { CallApi } from "@/apiList/CallApi";
import SpList from "@/Components/Pages/AddSpList/SPList/SpList";
import ReportList from "@/Components/Pages/EntryForm/ReportList/ReportList";
import { getClientIpAddress } from "@/Utils/globalFunc";
import LoadingBackdrop from "@/Utils/LoadingBackdrop";

const GridMain = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [tokenMissing, setTokenMissing] = useState(false);
  const searchParams = useSearchParams();
  const pid = searchParams.get("pid");
  const CN = searchParams.get("CN");
  const newToken = searchParams.get("Token");

  // metal loss summury  date solved

  // useEffect(() => {
  //   sessionStorage.setItem("5F383721-FC33-F111-B3AE-F875A496BA9D", JSON?.stringify({
  //     "tkn": "OTA2NTQ3MTcwMDUzNTY1MQ==",
  //     "pid": 18333,
  //     "IsEmpLogin": 0,
  //     "IsPower": 0,
  //     "SpNo": "MA==",
  //     "SpVer": "",
  //     "SV": "MA==",
  //     "LId": "MTE=",
  //     "LUId": "c3dhbWlAZWcuY29t",
  //     "DAU": "aHR0cDovL256ZW4vam8vYXBpLWxpYi9BcHAvQ2VudHJhbEFwaQ==",
  //     "YearCode": "e3tuemVufX17ezIwfX17e29yYWlsMjV9fXt7b3JhaWwyNX19",
  //     "cuVer": "UjUwQjM=",
  //     "rptapiurl": "aHR0cDovL25ld25leHRqcy53ZWIvYXBpL3JlcG9ydA=="
  // }))
  // window.location.replace("http://localhost:6007/R50B3/?CN=UkRTRF8yMDI2MDQwOTEwMDkwOV9iZGIzY2Y1NjRiNDc0NWJmYWY4NjNkYjBhZmI2MzZmNg==&pid=18333&Token=5F383721-FC33-F111-B3AE-F875A496BA9D");
  // }, []);

  
  function safeDecode(value) {
    if (!value) return value;

    try {
      let str = value.replace(/-/g, '+').replace(/_/g, '/');

      while (str.length % 4) {
        str += '=';
      }

      return atob(str);
    } catch (e) {
      console.warn("LUId not base64, using raw value:", value);
      return value; // 👈 IMPORTANT: don't break app
    }
  }

  useEffect(() => {
    getClientIpAddress();
    const initializeAndFetchReport = async () => {
      if (!newToken) {
        setTokenMissing(true);
        setIsLoading(false);
        return;
      }
      try {

        let parsedData;
        const storedJson = sessionStorage.getItem(newToken);

        if (storedJson) {
          parsedData = JSON.parse(storedJson);
          if (parsedData?.LUId) {
            parsedData.LUId = safeDecode(parsedData.LUId);
          }
          sessionStorage.setItem("reportVarible", JSON.stringify(parsedData));
        } else {
          const tokenBody = {
            ReqData: `[{\"ForEvt\":\"GetTokenVal\",\"Token\":\"${newToken}\"}]`,
          };

          const APIURL =
            window.location.hostname === "localhost" ||
              window.location.hostname === "dxreportsetup.web" ||
              window.location.hostname === "nzen"
              ? "http://nzen/jo/api-lib/App/CentralCrossDomainToken"
              : "https://vw.optigoapps.com/linkedapp/App/CentralCrossDomainToken";

          const tokenResponse = await axios.post(APIURL, tokenBody);
          const tokenData = tokenResponse?.data?.Data?.DT?.[0];

          const returnedToken = tokenData?.Token;
          const jsonDataString = tokenData?.JsonData;

          if (!jsonDataString || !returnedToken) {
            console.log('cal 2');
            setTokenMissing(true);
            return;
          }

          parsedData = JSON.parse(jsonDataString);
          if (parsedData?.LUId) {
            parsedData.LUId = atob(parsedData.LUId);
          }

          sessionStorage.setItem(newToken, JSON.stringify(parsedData));
          sessionStorage.setItem("reportVarible", JSON.stringify(parsedData));
        }

        const AllData = parsedData;
        const clientIpAddress = sessionStorage.getItem("clientIpAddress");

        const body = {
          con: JSON.stringify({
            id: "",
            mode: "getPageId",
            appuserid: AllData?.LUId,
            IPAddress: clientIpAddress,
          }),
          p: JSON.stringify({ PageId: pid }),
          f: "DynamicReport (get column data)",
        };
        const response = await CallApi(body);
        if (response?.Status === "400") {
          setTokenMissing(true);
          return;
        }

        setIsLoading(false);
        const data = response?.rd?.[0];
        if (data?.stat === 1) {
          const reportId = data.ReportId;
          const key = `${pid}_${reportId}`;
          sessionStorage.setItem(key, reportId);
        }
      } catch (err) {
        console.error("Error:", err);
        console.log('cal 4');
        setTokenMissing(true);
      }
    };

    initializeAndFetchReport();
  }, [pid, CN, newToken]);

  if (tokenMissing) {
    return (
      <div style={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="85vh"
          p={2}
        >
          <Paper
            elevation={3}
            sx={{
              maxWidth: 500,
              width: "100%",
              p: 4,
              borderRadius: "20px",
              textAlign: "center",
            }}
          >
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
              <AlertTriangle size={48} color="#f44336" />
            </div>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              You've been logged out
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Your session has ended. Please log in again to continue.
            </Typography>
          </Paper>
        </Box>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '95vh' }}>
        <LoadingBackdrop isLoading={isLoading} />
      </div>
    );
  }

  if (pid === "18363") {
    return <SpList />;
  }

  return <ReportList />;
};

export default GridMain;