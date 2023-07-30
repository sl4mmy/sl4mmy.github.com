// Don't render Alaska or Hawaii since the US avg temp dataset above does not
// include any data for either :(
const IGNORED_STATES_FIPS_CODE_PREFIXES = [];

/*
 * NOTE: in the end, I gave up trying to find data for all of these
 *       counties, and only manually created historical temperature data for
 *       Chicago.
 */
const mostPopulousCountiesPlusChampaign = d3.csv(US_COUNTY_POPULATION_DATASET, (d) => {
  const geographicArea = d['Geographic Area'];
  const population = Number(d['Population Estimate (as of July 1) 2022']);

  if (geographicArea === 'United States') {
    return {
      county: 'United States',
      state: 'USA',
      population: population,
    };
  }

  // Remove leading '.' from county names, and separate county & state into
  // separate components
  const geographicAreaParts = geographicArea.split('.')[1].split(', ');

  const county = geographicAreaParts[0];
  const state = geographicAreaParts[1];

  return {
    county: county,
    state: state,
    population: population,
  };
}).then((data) => {
  const mostPopulousCounties = data
    .filter((d) => d.county !== 'United States')
    .toSorted((left, right) => right.population - left.population) // Sort in descending order
    .slice(0, 10) // Grab the 10 most populous counties
    .filter((d) => d.state !== 'California' || (d.county !== 'Orange County' && d.county !== 'Riverside County')); // Reduce the number of annotations in southern CA

  const champaignCounty = data
    .find((d) => d.county.startsWith('Champaign') && d.state == 'Illinois');

  return [...mostPopulousCounties, champaignCounty];
}).then((data) => data
  .filter((d) => d.county === 'Cook County' && d.state === 'Illinois') // Only have historical data for Chicago :(
);

d3.csv(US_AVERAGE_TEMPERATURE_DATASET, (d) => ({
  id: d.ID,
  county: d.Name,
  state: d.State,
  averageTemp: Number(d.Value),
  historicalMean: Number(d['1901-2000 Mean']),
  anomaly: Number(d['Anomaly (1901-2000 base period)']),
})).then(async (data) => await d3.csv(US_STATE_FIPS_CODE_MAPPING_DATASET).then(
  (fipsMappings) => {
    fipsMappings.forEach((fipsMapping) => {
      const fipsCodePrefix = fipsMapping['State-level FIPS code'];

      const placeName = fipsMapping['Place name'];
      if (placeName === 'Alaska' || placeName === 'Hawaii') {
        IGNORED_STATES_FIPS_CODE_PREFIXES.push(fipsCodePrefix);

        return;  // Skip to next fipsMapping
      }

      const originalIdPrefix = `${fipsMapping.Abbreviation}-`;
      const updatedIdPrefix = `${fipsCodePrefix}`;

      data.filter((d) => d.id.startsWith(originalIdPrefix)).forEach((d) => {
        const originalId = d.id;
        const updatedId = originalId.replace(originalIdPrefix, updatedIdPrefix);

        d.id = updatedId;
      });
    });

    return data;
  }
)).then(async (data) => {
  const colorScale = d3.scaleQuantize([1, 10], d3.schemeOranges[9]);
  const path = d3.geoPath();
  const valuemap = new Map(data.map((d) => [d.id, d.anomaly]));

  const us = await d3.json(US_TOPOJSON_DATASET);

  const counties = topojson.feature(us, us.objects.counties);
  const states = topojson.feature(us, us.objects.states);
  const statemap = new Map(states.features.map((d) => [d.id, d]));
  const statemesh = topojson.mesh(us, us.objects.states);

/*
  const countiesToAnnotate = (await mostPopulousCountiesPlusChampaign)
    .map((county) => {
      const countyName = county.county;
      const state = county.state;

      const matchingCountyData = data.find((d) => countyName === d.county && state === d.state);

      return {
        ...matchingCountyData,
        ...county,
      };
    });
  const countiesToAnnotateIds = countiesToAnnotate.map((county) => county.id);

  const annotations = counties.features
    .filter((county) => countiesToAnnotateIds.includes(county.id))
    .map((county) => {
      const index = countiesToAnnotateIds.indexOf(county.id);
      const countyToAnnotate = countiesToAnnotate[index];

      return {
        note: {
          title: `${countyToAnnotate.county}, ${countyToAnnotate.state}`,
          label: `${countyToAnnotate.anomaly} deg C higher than average, population ${countyToAnnotate.population}`,
          orientation: `leftRight`,
          padding: 15,
        },
        x: path.centroid(county.geometry)[0],
        y: path.centroid(county.geometry)[1],
        dx: 10,
        dy: 10,
        subject: {
          text: `${countyToAnnotate.anomaly}°F`,
          radius: 25,
          y: 'top',
        },
      };
    });
  console.log(annotations);

  const makeAnnotations = d3.annotation()
    .type(d3.annotationBadge)
    .annotations(annotations)
    .editMode(false)
    .on('subjectclick', (d) => {
       console.log(d);
     });
 */

  const svg = d3.select('#scene-2 svg');

  svg.append('g')
    .attr('transform', 'translate(610, 20)')
    .append(() => Legend(colorScale, {title: 'Temperature anomaly (° F above 1901-2000 average)', width: 260}))
    .style('font-family', 'Roboto, sans-serif')
    .style('font-size', '14px');

  svg.append('g')
    .selectAll('path')
    .data(counties.features)
    .join('path')
      .attr('fill', (d) => colorScale(valuemap.get(d.id)))
      .attr('d', path)
    .append('title')
      .text((d) => `${d.properties.name}, ${statemap.get(d.id.slice(0, 2)).properties.name}\n${valuemap.get(d.id)}°F`);

  svg.append('path')
      .datum(statemesh)
      .attr('fill', 'none')
      .attr('stroke', 'black')
      .attr('stroke-linejoin', 'round')
      .attr('d', path);

/*
  svg.append("g")
    .attr("class", "annotation-group")
    .call(makeAnnotations);
 */
});
