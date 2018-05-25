d3.select('#contourdown')
    .style('width','100%')
    .style('height',0)
    .style('padding-bottom', 'calc(100% / 1.5)')

opentype.load('fonts/WorkSans-Hairline.otf', function(err, font) {
    if (err) {
        alert('Font could not be loaded: ' + err);
    } else {

        let W = d3.select('#contourdown').node().getBoundingClientRect().width,
            H = d3.select('#contourdown').node().getBoundingClientRect().height;

        let w = 768,
            h = 768 / 3 * 2;

        let delta_h = h;
        let string;
        var pathData;

        // parameters set for 768 px width svg
        let pointsAmount, pointsLetter = 75,
            moveRandomly = 6,
            bandwidth = 10;

        let svg = d3.select('#contourdown')
            .append('svg')
            .attr('viewBox', `0 0 ${w} ${h}`)
            .attr('preserveAspectRatio', `xMidYMid meet`)
            .style('width', '100%')
            .style('height', 'auto')
            .style('background-color', '#f5f5f5')

        let g = svg.append('g')

        let counterText = g.append('path')
            .attr('class', 'outlined-texts')
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
        let idleInterval = setInterval(timerIncrement, 1000);

        // timerIncrement('RAW');



        function timerIncrement(txt) {

            string = txt ? txt : formatTime(new Date);

            pointsAmount = string.length * pointsLetter;

            delta_h = h / 2 + counterText.node().getBBox().height / 2;

            pathData = font.getPath(string, 50, 310, 188);
            pathData = pathData.toPathData();
            counterText.attr('d', pathData);

            let pointsData = [];

            for (i = 1; i <= pointsAmount; i++) {
                let position = d3.select('.outlined-texts').node().getTotalLength() / pointsAmount * i;
                let thisPoint = d3.selectAll('.outlined-texts').node().getPointAtLength(position);
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

            for (i = 1; i <= h / 2; i++) {
                let thisX = d3.randomUniform(0, w)();
                let thisY = d3.randomUniform(0, h)()
                let randomPoint = {
                    x: thisX,
                    y: thisY,
                    id: pointsAmount + i
                }
                pointsData.push(randomPoint);
            }

            contours = contours.data(d3.contourDensity()
                .x(function(d) { return d.x; return x(d.x); })
                .y(function(d) { return d.y; return y(d.y); })
                .size([w, h])
                .bandwidth(bandwidth)
                (pointsData),
                function(d) { return d.id; })

            contours.exit().remove();

            contours = contours.enter().append("path")
                .classed('contour', true)
                .style('stroke-width', 0.4)
                .style('fill', 'none')
                .merge(contours)
                .attr("d", d3.geoPath())
                .style("stroke", function(d) { return color(d.value); })

        }

    }
});