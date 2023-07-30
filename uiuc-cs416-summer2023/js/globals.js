const CHICAGO_WEATHER_DATASET = "./data/chicago-weather-202206.csv";

const GLOBAL_AVERAGE_TEMPERATURE_DATASET = "./data/noaa-ncei-northern-hempisphere-land-and-ocean-temperature-anomalies-1880-2022.csv";
const US_AVERAGE_TEMPERATURE_DATASET = "./data/noaa-ncei-us-county-average-temperature-202206.csv";

const US_COUNTY_POPULATION_DATASET = "./data/census-bureau-us-county-population-estimates-2022.csv";

const US_STATE_FIPS_CODE_MAPPING_DATASET = "./data/state-level-fips-code-mapping.csv";

// const US_TOPOJSON_DATASET = "https://d3js.org/us-10m.v1.json";
// const US_TOPOJSON_DATASET = "./data/us-10m.v1.json";
const US_TOPOJSON_DATASET = "https://cdn.jsdelivr.net/npm/us-atlas@3/counties-albers-10m.json";
// const US_TOPOJSON_DATASET = "./data/counties-albers-10m.json";

const margin = {
  top: 50,
  right: 200,
  bottom: 50,
  left: 50,
};

const maxHeight = 1024;
const maxWidth = 1200;

const xRange = [margin.left, maxWidth - margin.right];
const yRange = [maxHeight - margin.bottom, margin.top];

const svgs = d3.selectAll(".svg-visualization")
  .append("svg")
  .attr("viewBox", `0 0 ${maxWidth} ${maxHeight}`);
  // .style("border", "1px solid blue");
