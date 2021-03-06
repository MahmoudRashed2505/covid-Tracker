import React, { useState, useEffect } from 'react';
import { MenuItem, FormControl, Select, Card, CardContent } from "@material-ui/core";
import './App.css';
import InfoBox from "./InfoBox"
import Map from "./Map";
import Table from "./Table";
import { sortData, prettyprintStat } from './util';
import LineGraph from "./LineGraph"
import "leaflet/dist/leaflet.css";


function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState('worldwide');
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountires, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState("cases");


  //API to get Countries and all information needed
  //https://disease.sh/v3/covid-19/countries

  //USEEFFECT = runs a piece of code based on a condition

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then(response => response.json())
      .then(data => {
        setCountryInfo(data)
      });
  }, []);

  useEffect(() => {
    // The Code here Will run only once When the Component Loads
    // async --> send a reques, wait for it, process the response

    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries").
        then((response) => response.json()).
        then((data) => {
          const countries = data.map((country) => (
            {
              name: country.country, // United States, United Kingdom
              value: country.countryInfo.iso2 // US, UK
            }));
          const sortedData = sortData(data);
          setTableData(sortedData);
          setCountries(countries);
          setMapCountries(data);
        });
    };
    getCountriesData();
  }, []);

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;
    console.log("YOOOOO >>>>>>> ", countryCode);

    const url = countryCode === "worldwide" ? 'https://disease.sh/v3/covid-19/all' :
      `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url)
      .then(response => response.json())
      .then(data => {
        setCountry(countryCode);
        setCountryInfo(data);
        if (countryCode === "worldwide") {
          setMapZoom(3);
          setMapCenter({ lat: 34.80746, lng: -40.4796 });
        }
        else {
          setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
          setMapZoom(4);
        }
      })
  };

  return (
    <div className="app">

      <div className="app__left">
        {/* Header */}
        {/* Title + Select Input Dropdown field*/}

        <div className="app__header">
          <h1>COVID-19 TRACKER</h1>
          <FormControl className="app__dropdown">
            <Select variant="outlined"
              onChange={onCountryChange}
              value={country}>
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {/* Loop through all the countries and show a drop down list of the options*/}
              {countries.map((country) => (
                <MenuItem value={country.value}>{country.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <div className="app__stats">
          {/* InfoBox title="Coronavirus cases*/}
          <InfoBox
            isRed
            active={casesType === "cases"}
            onClick={(e) => setCasesType("cases")}
            title="Coronavirus Cases" total={prettyprintStat(countryInfo.cases)} cases={prettyprintStat(countryInfo.todayCases)} />

          {/* InfoBoxe* title="Coronavirus recoveries" */}
          <InfoBox
            active={casesType === "recovered"}
            onClick={(e) => setCasesType("recovered")}
            title="Recoveries" total={prettyprintStat(countryInfo.recovered)} cases={prettyprintStat(countryInfo.todayRecovered)} />

          {/* InfoBoxe* title="Corona Death" */}
          <InfoBox
            isRed
            active={casesType === "deaths"}
            onClick={(e) => setCasesType("deaths")}
            title="Death" total={prettyprintStat(countryInfo.deaths)} cases={prettyprintStat(countryInfo.todayDeaths)} />

        </div>




        {/* Map */}
        <Map countries={mapCountires} center={mapCenter} zoom={mapZoom} casesType={casesType} />
      </div >
      <div className="app__right">
        <Card >
          <CardContent>
            {/* Table */}
            <h3 className="worldCases">Live Cases by the Country</h3>
            <Table countries={tableData} />
            {/* Graph */}
            <h3 className="worldCases">Worldwide new {casesType}</h3>
            <LineGraph casesType={casesType} />
          </CardContent>

        </Card>
      </div>
    </div>

  );
}

export default App;
