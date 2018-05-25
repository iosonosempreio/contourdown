// const toPoints = SVGPoints.toPoints
// const toPath = SVGPoints.toPath

opentype.load('fonts/WorkSans-Hairline.otf', function(err, font) {
    if (err) {
        alert('Font could not be loaded: ' + err);
    } else {

        let w = d3.select('#contourdown').node().getBoundingClientRect().width,
            h = d3.select('#contourdown').node().getBoundingClientRect().height;

        let delta_h = h;

        let pointsAmount = 300, moveRandomly = 6;

        let svg = d3.select('#contourdown').append('svg')
            .attr('width', w)
            .attr('height', h)
        // .style('background-color', '#e4e4e4')

        let g = svg.append('g')

        let counterText = g.append('path')
            .attr('class', 'outlined-texts')
            // .attr('fill', 'red')
            .style('opacity', '0')

        let points = g.selectAll('.points');

        let contours = svg.insert("g", "g")
            .classed('contours-group', true)
            .attr("stroke-linejoin", "round")
            .selectAll("path")


        var color = d3.scaleSequential()
            .domain([0, 0.01]) // Points per square pixel.
            .interpolator(d3.interpolateRainbow)

        var formatTime = d3.timeFormat("%H %M %S");
        // formatTime(new Date); // "June 30, 2015"

        let string;

        let idleInterval = setInterval(timerIncrement, 1000);

        // timerIncrement('RAW');

        var pathData;

        function timerIncrement(txt) {

            string = txt ? txt : formatTime(new Date);

            pointsAmount = string.length*75;

            // string = 
            // console.log(string);



            if ( !pathData ) {
                pathData = font.getPath(string, 25, delta_h, w / 4.1);
                pathData = pathData.toPathData();
                counterText.attr('d', pathData);
            }

            delta_h = h / 2 + counterText.node().getBBox().height / 2;

            pathData = font.getPath(string, 25, delta_h, w / 4.1);
            pathData = pathData.toPathData();
            counterText.attr('d', pathData);


            let pointsData = [];

            for (i = 1; i <= pointsAmount; i++) {
                // console.log(i)
                let position = d3.select('.outlined-texts').node().getTotalLength() / pointsAmount * i;
                let thisPoint = d3.selectAll('.outlined-texts').node().getPointAtLength(position);
                // console.log(thisPoint);
                thisPoint.id = i;
                pointsData.push(thisPoint);
            }

            pointsData = pointsData.map(function(d) {
                return {
                    'x': d.x + d3.randomUniform(-moveRandomly, moveRandomly)(),
                    'y': d.y + d3.randomUniform(-moveRandomly, moveRandomly)(),
                    'id': d.id
                }
            })

            for (i = 1; i <= h/2; i++) {
                let thisX = d3.randomUniform(0, w)();
                let thisY = d3.randomUniform(0, h)()
                let randomPoint = {
                    x: thisX,
                    y: thisY,
                    id: pointsAmount + i
                }
                pointsData.push(randomPoint);
            }

            // console.log(pointsData)

            // points = points.data(pointsData, function(d) { return d.id; })

            // points.exit().remove();

            // points = points.enter().append('circle').classed('points', true)
            //     .attr('fill', 'grey')
            //     .attr('r', 1)
            //     .style('opacity',1)
            //     .merge(points)
            //     .attr('cx', function(d) { return d.x })
            //     .attr('cy', function(d) { return d.y })

            contours = contours.data(d3.contourDensity()
                .x(function(d) { return d.x; return x(d.x); })
                .y(function(d) { return d.y; return y(d.y); })
                .size([w, h])
                .bandwidth(13)
                (pointsData),
                function(d) { return d.id; })

            contours.exit().remove();

            contours = contours.enter().append("path")
                .merge(contours)
                .classed('contour', true)
                .attr("d", d3.geoPath())
                .attr("stroke", function(d) { return color(d.value); })

            // contours.transition()
            // .duration(500)
            // .attr("d", d3.geoPath())

        }

    }
});