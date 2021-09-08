# Grid2D

A basic Javascript class for simplifying the implementation of algorithms that rely on a 2D grid data structure.

## Motivation

Several creative coding algorithms rely on a 2D grid data structure, for example those based on [_flow fields_](https://tylerxhobbs.com/essays/2020/flow-fields), or [Jared Tarbell's Substrate](http://www.complexification.net/gallery/machines/substrate/). I wrote this class to provide basic the basic methods that those algorithms need.

It is probably not comprehensive, or particularly well designed/implemented, but I found it useful in several projects.

## Usage

After importing the `Grid2D` class, you can create a new grid with 100 rows and 50 columns with:

    const grid = new Grid2D(100,100);

and, by default, all cells will be initialized with a 0 value. You can also set the initial value to some value `v` with

    const grid = new Grid2D(100,100,v);

You can set the value of certain cell with `grid.setValue( row, column, v);` and get a value with `grid.getValue(row, column)`.

Sometimes, it is useful to consider each cell as having a physical dimension, e.g. 20x20 pixels (or whatever unit of measurement). To create a grid of such kind, you can write

    const grid = new Grid2D(100,100,v, 20, 20);

In this case, the grid has a width of 100 and an height of 100, and each cell is 20x20, so the grid has 5 rows and 5 columns (yes,
dimensions default to 1, so, when you don't specify them, the first two parameter indicate width/number of columns and height/number of rows). Cell dimensions are useful for operations such as `getValueAtPoint(x,y)` `or getCellAtPoint(x,y)`. Suppose, for example, that your algorithm has to draw pixels on a 900x900 canvas, but has to reason with a grid of 100x100 cells, each 90x90 pixels. You can now, starting from the pixel coordinates, get the cell and its value.

Finally, you can position your grid in the 2D plane, or in the canvas:

    const grid = new Grid2D(100,100,v, 20, 20, 100, 100);

i.e., a grid with width=100, height=100, with origin in (100, 100), where each cell is 20x20. The last two parameters default to 0.

Additional methods include filling the grid using a function, checking if a condition is true for every/at least one cell neighbours, iterating over cells, performing a convolution with a 3x3 matrix (see code and its documentation).

## Practical Examples

Following [this nice introduction to drawing with flow fields](https://tylerxhobbs.com/essays/2020/flow-fields), the main data structure can be implemented like this (width and height refer to the canvas):

    const flowField = new Grid(
        Math.floor(width * 2),
        Math.floor(height * 2),
        PI * 0.25,
        width * 0.01,
        width * 0.01,
        Math.floor(width * -0.5),
        Math.floor(height * -0.5)
    );

and then we can fill proper flow values, e.g., with

    flowField.fill( (column, row) => (row / float(flowField.num_rows)) * PI );

or, more interestingly, with some noise values. If you want to avoid collisions between flows, you can create an additional grid, perhaps with a coarser resolution, and use it to store occupancy values (e.g. 0 = free, 1 = occupied), and then check for collisions by doing occupancy tests.

The following images were created using this approach and the Grid2D code:

<img src="https://ipfs.io/ipfs/bafybeia2qire3dlli7vmrgzrssl2dl55adhwcaqeocxoz7j5j3t3msberi" alt="flow field example" width="300" height="150">
<img src="https://ipfs.io/ipfs/QmeSpajdK7SuhrLbyfzXpafytzYqqMvX7mhSesaKEAbBPj" alt="flow field example" width="300" height="150">

Substrate by Jared Tarbell is another famous generative artwork based on a grid. I won't explain the whole algorith, but the basic building blocks are: - drawing lines (_cracks_ in Jared formulation) from a starting point, adding a few points per frame - check collisions of lines that we are drawing with other existing lines - draw new lines starting from points in existing lines, at 90 degrees wrt existing lines

To do that, the idea is to use a grid sized as the canvas, where each value indicates: - the angle of the line, or - a certain high value (10001) to indicate that no line has been drawn in that pixel

    grid = new Grid(width, height, 10001);

Each line we are drawing is now a point in our canvas, which corresponds to a cell in our grid, and an angle (direction in which to grow the line). As the line passes through a cell, we will write its angle in the cell, after reading the value to check for collisions.
If you try to implement the whole algorithm using Grid2D, you will find the resulting code considerably shorter and more readable.
