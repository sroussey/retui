- _A terminal UI + React library with a focus on events, keymaps, and
  navigation. Forked from [Ink](https://github.com/vadimdemedes/ink)._

```sh
npm install retuink
```

# retuink

## Table of Contents

- [Overview](#overview)
- [Components](#components)
  - [Text](#text)
    - [color](#color)
    - [backgroundColor](#backgroundcolor)
    - [dimColor](#dimcolor)
    - [bold](#bold)
    - [italic](#italic)
    - [underline](#underline)
    - [strikethrough](#strikethrough)
    - [inverse](#inverse)
    - [wrap](#wrap)
  - [Box](#box)
    - [Dimensions](#dimensions)
      - [width](#width)
      - [height](#height)
      - [minWidth](#minwidth)
      - [minHeight](#minheight)
    - [Padding](#padding)
      - [paddingTop](#paddingtop)
      - [paddingBottom](#paddingbottom)
      - [paddingLeft](#paddingleft)
      - [paddingRight](#paddingright)
      - [paddingX](#paddingx)
      - [paddingY](#paddingy)
- [Navigation](#navigation)
  - [Pages / usePages](#pages)
  - [Lists / useList](#lists)
  - [Node / useNodeMap](#node)
  - [Modal / useModal](#modal)

## Components

### `<Text>`

This component can display text, and change its style to make it bold, underline, italic or strikethrough.

```jsx
import {render, Text} from 'ink';

const Example = () => (
	<>
		<Text color="green">I am green</Text>
		<Text color="black" backgroundColor="white">
			I am black on white
		</Text>
		<Text color="#ffffff">I am white</Text>
		<Text bold>I am bold</Text>
		<Text italic>I am italic</Text>
		<Text underline>I am underline</Text>
		<Text strikethrough>I am strikethrough</Text>
		<Text inverse>I am inversed</Text>
	</>
);

render(<Example />);
```

**Note:** `<Text>` allows only text nodes and nested `<Text>` components inside of it. For example, `<Box>` component can't be used inside `<Text>`.

#### color

Type: `string`

Change text color.
Ink uses [chalk](https://github.com/chalk/chalk) under the hood, so all its functionality is supported.

```jsx
<Text color="green">Green</Text>
<Text color="#005cc5">Blue</Text>
<Text color="rgb(232, 131, 136)">Red</Text>
```

<img src="media/text-color.jpg" width="247">

#### backgroundColor

Type: `string`

Same as `color` above, but for background.

```jsx
<Text backgroundColor="green" color="white">Green</Text>
<Text backgroundColor="#005cc5" color="white">Blue</Text>
<Text backgroundColor="rgb(232, 131, 136)" color="white">Red</Text>
```

<img src="media/text-backgroundColor.jpg" width="226">

#### dimColor

Type: `boolean`\
Default: `false`

Dim the color (emit a small amount of light).

```jsx
<Text color="red" dimColor>
	Dimmed Red
</Text>
```

<img src="media/text-dimColor.jpg" width="138">

#### bold

Type: `boolean`\
Default: `false`

Make the text bold.

#### italic

Type: `boolean`\
Default: `false`

Make the text italic.

#### underline

Type: `boolean`\
Default: `false`

Make the text underlined.

#### strikethrough

Type: `boolean`\
Default: `false`

Make the text crossed with a line.

#### inverse

Type: `boolean`\
Default: `false`

Inverse background and foreground colors.

```jsx
<Text inverse color="yellow">
	Inversed Yellow
</Text>
```

<img src="media/text-inverse.jpg" width="138">

#### wrap

Type: `string`\
Allowed values: `wrap` `truncate` `truncate-start` `truncate-middle` `truncate-end`\
Default: `wrap`

This property tells Ink to wrap or truncate text if its width is larger than container.
If `wrap` is passed (by default), Ink will wrap text and split it into multiple lines.
If `truncate-*` is passed, Ink will truncate text instead, which will result in one line of text with the rest cut off.

```jsx
<Box width={7}>
	<Text>Hello World</Text>
</Box>
//=> 'Hello\nWorld'

// `truncate` is an alias to `truncate-end`
<Box width={7}>
	<Text wrap="truncate">Hello World</Text>
</Box>
//=> 'Hello…'

<Box width={7}>
	<Text wrap="truncate-middle">Hello World</Text>
</Box>
//=> 'He…ld'

<Box width={7}>
	<Text wrap="truncate-start">Hello World</Text>
</Box>
//=> '…World'
```

### `<Box>`

`<Box>` is an essential Ink component to build your layout.
It's like `<div style="display: flex">` in the browser.

```jsx
import {render, Box, Text} from 'ink';

const Example = () => (
	<Box margin={2}>
		<Text>This is a box with margin</Text>
	</Box>
);

render(<Example />);
```

#### Dimensions

##### width

Type: `number` `string`

Width of the element in spaces.
You can also set it in percent, which will calculate the width based on the width of parent element.

```jsx
<Box width={4}>
	<Text>X</Text>
</Box>
//=> 'X   '
```

```jsx
<Box width={10}>
	<Box width="50%">
		<Text>X</Text>
	</Box>
	<Text>Y</Text>
</Box>
//=> 'X    Y'
```

##### height

Type: `number` `string`

Height of the element in lines (rows).
You can also set it in percent, which will calculate the height based on the height of parent element.

```jsx
<Box height={4}>
	<Text>X</Text>
</Box>
//=> 'X\n\n\n'
```

```jsx
<Box height={6} flexDirection="column">
	<Box height="50%">
		<Text>X</Text>
	</Box>
	<Text>Y</Text>
</Box>
//=> 'X\n\n\nY\n\n'
```

##### minWidth

Type: `number`

Sets a minimum width of the element.
Percentages aren't supported yet, see https://github.com/facebook/yoga/issues/872.

##### minHeight

Type: `number`

Sets a minimum height of the element.
Percentages aren't supported yet, see https://github.com/facebook/yoga/issues/872.

#### Padding

##### paddingTop

Type: `number`\
Default: `0`

Top padding.

##### paddingBottom

Type: `number`\
Default: `0`

Bottom padding.

##### paddingLeft

Type: `number`\
Default: `0`

Left padding.

##### paddingRight

Type: `number`\
Default: `0`

Right padding.

##### paddingX

Type: `number`\
Default: `0`

Horizontal padding. Equivalent to setting `paddingLeft` and `paddingRight`.

##### paddingY

Type: `number`\
Default: `0`

Vertical padding. Equivalent to setting `paddingTop` and `paddingBottom`.

##### padding

Type: `number`\
Default: `0`

Padding on all sides. Equivalent to setting `paddingTop`, `paddingBottom`, `paddingLeft` and `paddingRight`.

```jsx
<Box paddingTop={2}>Top</Box>
<Box paddingBottom={2}>Bottom</Box>
<Box paddingLeft={2}>Left</Box>
<Box paddingRight={2}>Right</Box>
<Box paddingX={2}>Left and right</Box>
<Box paddingY={2}>Top and bottom</Box>
<Box padding={2}>Top, bottom, left and right</Box>
```

#### Margin

##### marginTop

Type: `number`\
Default: `0`

Top margin.

##### marginBottom

Type: `number`\
Default: `0`

Bottom margin.

##### marginLeft

Type: `number`\
Default: `0`

Left margin.

##### marginRight

Type: `number`\
Default: `0`

Right margin.

##### marginX

Type: `number`\
Default: `0`

Horizontal margin. Equivalent to setting `marginLeft` and `marginRight`.

##### marginY

Type: `number`\
Default: `0`

Vertical margin. Equivalent to setting `marginTop` and `marginBottom`.

##### margin

Type: `number`\
Default: `0`

Margin on all sides. Equivalent to setting `marginTop`, `marginBottom`, `marginLeft` and `marginRight`.

```jsx
<Box marginTop={2}>Top</Box>
<Box marginBottom={2}>Bottom</Box>
<Box marginLeft={2}>Left</Box>
<Box marginRight={2}>Right</Box>
<Box marginX={2}>Left and right</Box>
<Box marginY={2}>Top and bottom</Box>
<Box margin={2}>Top, bottom, left and right</Box>
```

#### Gap

#### gap

Type: `number`\
Default: `0`

Size of the gap between an element's columns and rows. Shorthand for `columnGap` and `rowGap`.

```jsx
<Box gap={1} width={3} flexWrap="wrap">
	<Text>A</Text>
	<Text>B</Text>
	<Text>C</Text>
</Box>
// A B
//
// C
```

#### columnGap

Type: `number`\
Default: `0`

Size of the gap between an element's columns.

```jsx
<Box columnGap={1}>
	<Text>A</Text>
	<Text>B</Text>
</Box>
// A B
```

#### rowGap

Type: `number`\
Default: `0`

Size of the gap between element's rows.

```jsx
<Box flexDirection="column" rowGap={1}>
	<Text>A</Text>
	<Text>B</Text>
</Box>
// A
//
// B
```

#### Flex

##### flexGrow

Type: `number`\
Default: `0`

See [flex-grow](https://css-tricks.com/almanac/properties/f/flex-grow/).

```jsx
<Box>
	<Text>Label:</Text>
	<Box flexGrow={1}>
		<Text>Fills all remaining space</Text>
	</Box>
</Box>
```

##### flexShrink

Type: `number`\
Default: `1`

See [flex-shrink](https://css-tricks.com/almanac/properties/f/flex-shrink/).

```jsx
<Box width={20}>
	<Box flexShrink={2} width={10}>
		<Text>Will be 1/4</Text>
	</Box>
	<Box width={10}>
		<Text>Will be 3/4</Text>
	</Box>
</Box>
```

##### flexBasis

Type: `number` `string`

See [flex-basis](https://css-tricks.com/almanac/properties/f/flex-basis/).

```jsx
<Box width={6}>
	<Box flexBasis={3}>
		<Text>X</Text>
	</Box>
	<Text>Y</Text>
</Box>
//=> 'X  Y'
```

```jsx
<Box width={6}>
	<Box flexBasis="50%">
		<Text>X</Text>
	</Box>
	<Text>Y</Text>
</Box>
//=> 'X  Y'
```

##### flexDirection

Type: `string`\
Allowed values: `row` `row-reverse` `column` `column-reverse`

See [flex-direction](https://css-tricks.com/almanac/properties/f/flex-direction/).

```jsx
<Box>
	<Box marginRight={1}>
		<Text>X</Text>
	</Box>
	<Text>Y</Text>
</Box>
// X Y

<Box flexDirection="row-reverse">
	<Text>X</Text>
	<Box marginRight={1}>
		<Text>Y</Text>
	</Box>
</Box>
// Y X

<Box flexDirection="column">
	<Text>X</Text>
	<Text>Y</Text>
</Box>
// X
// Y

<Box flexDirection="column-reverse">
	<Text>X</Text>
	<Text>Y</Text>
</Box>
// Y
// X
```

##### flexWrap

Type: `string`\
Allowed values: `nowrap` `wrap` `wrap-reverse`

See [flex-wrap](https://css-tricks.com/almanac/properties/f/flex-wrap/).

```jsx
<Box width={2} flexWrap="wrap">
	<Text>A</Text>
	<Text>BC</Text>
</Box>
// A
// B C
```

```jsx
<Box flexDirection="column" height={2} flexWrap="wrap">
	<Text>A</Text>
	<Text>B</Text>
	<Text>C</Text>
</Box>
// A C
// B
```

##### alignItems

Type: `string`\
Allowed values: `flex-start` `center` `flex-end`

See [align-items](https://css-tricks.com/almanac/properties/a/align-items/).

```jsx
<Box alignItems="flex-start">
	<Box marginRight={1}>
		<Text>X</Text>
	</Box>
	<Text>
		A
		<Newline/>
		B
		<Newline/>
		C
	</Text>
</Box>
// X A
//   B
//   C

<Box alignItems="center">
	<Box marginRight={1}>
		<Text>X</Text>
	</Box>
	<Text>
		A
		<Newline/>
		B
		<Newline/>
		C
	</Text>
</Box>
//   A
// X B
//   C

<Box alignItems="flex-end">
	<Box marginRight={1}>
		<Text>X</Text>
	</Box>
	<Text>
		A
		<Newline/>
		B
		<Newline/>
		C
	</Text>
</Box>
//   A
//   B
// X C
```

##### alignSelf

Type: `string`\
Default: `auto`\
Allowed values: `auto` `flex-start` `center` `flex-end`

See [align-self](https://css-tricks.com/almanac/properties/a/align-self/).

```jsx
<Box height={3}>
	<Box alignSelf="flex-start">
		<Text>X</Text>
	</Box>
</Box>
// X
//
//

<Box height={3}>
	<Box alignSelf="center">
		<Text>X</Text>
	</Box>
</Box>
//
// X
//

<Box height={3}>
	<Box alignSelf="flex-end">
		<Text>X</Text>
	</Box>
</Box>
//
//
// X
```

##### justifyContent

Type: `string`\
Allowed values: `flex-start` `center` `flex-end` `space-between` `space-around` `space-evenly`

See [justify-content](https://css-tricks.com/almanac/properties/j/justify-content/).

```jsx
<Box justifyContent="flex-start">
	<Text>X</Text>
</Box>
// [X      ]

<Box justifyContent="center">
	<Text>X</Text>
</Box>
// [   X   ]

<Box justifyContent="flex-end">
	<Text>X</Text>
</Box>
// [      X]

<Box justifyContent="space-between">
	<Text>X</Text>
	<Text>Y</Text>
</Box>
// [X      Y]

<Box justifyContent="space-around">
	<Text>X</Text>
	<Text>Y</Text>
</Box>
// [  X   Y  ]

<Box justifyContent="space-evenly">
	<Text>X</Text>
	<Text>Y</Text>
</Box>
// [   X   Y   ]
```

#### Visibility

##### display

Type: `string`\
Allowed values: `flex` `none`\
Default: `flex`

Set this property to `none` to hide the element.

##### overflowX

Type: `string`\
Allowed values: `visible` `hidden`\
Default: `visible`

Behavior for an element's overflow in horizontal direction.

##### overflowY

Type: `string`\
Allowed values: `visible` `hidden`\
Default: `visible`

Behavior for an element's overflow in vertical direction.

##### overflow

Type: `string`\
Allowed values: `visible` `hidden`\
Default: `visible`

Shortcut for setting `overflowX` and `overflowY` at the same time.

#### Borders

##### borderStyle

Type: `string`\
Allowed values: `single` `double` `round` `bold` `singleDouble` `doubleSingle` `classic` | `BoxStyle`

Add a border with a specified style.
If `borderStyle` is `undefined` (which it is by default), no border will be added.
Ink uses border styles from [`cli-boxes`](https://github.com/sindresorhus/cli-boxes) module.

```jsx
<Box flexDirection="column">
	<Box>
		<Box borderStyle="single" marginRight={2}>
			<Text>single</Text>
		</Box>

		<Box borderStyle="double" marginRight={2}>
			<Text>double</Text>
		</Box>

		<Box borderStyle="round" marginRight={2}>
			<Text>round</Text>
		</Box>

		<Box borderStyle="bold">
			<Text>bold</Text>
		</Box>
	</Box>

	<Box marginTop={1}>
		<Box borderStyle="singleDouble" marginRight={2}>
			<Text>singleDouble</Text>
		</Box>

		<Box borderStyle="doubleSingle" marginRight={2}>
			<Text>doubleSingle</Text>
		</Box>

		<Box borderStyle="classic">
			<Text>classic</Text>
		</Box>
	</Box>
</Box>
```

<img src="media/box-borderStyle.jpg" width="521">

Alternatively, pass a custom border style like so:

```jsx
<Box
	borderStyle={{
		topLeft: '↘',
		top: '↓',
		topRight: '↙',
		left: '→',
		bottomLeft: '↗',
		bottom: '↑',
		bottomRight: '↖',
		right: '←'
	}}
>
	<Text>Custom</Text>
</Box>
```

See example in [examples/borders](examples/borders/borders.tsx).

##### borderColor

Type: `string`

Change border color.
Shorthand for setting `borderTopColor`, `borderRightColor`, `borderBottomColor` and `borderLeftColor`.

```jsx
<Box borderStyle="round" borderColor="green">
	<Text>Green Rounded Box</Text>
</Box>
```

<img src="media/box-borderColor.jpg" width="228">

##### borderTopColor

Type: `string`

Change top border color.
Accepts the same values as [`color`](#color) in `<Text>` component.

```jsx
<Box borderStyle="round" borderTopColor="green">
	<Text>Hello world</Text>
</Box>
```

##### borderRightColor

Type: `string`

Change right border color.
Accepts the same values as [`color`](#color) in `<Text>` component.

```jsx
<Box borderStyle="round" borderRightColor="green">
	<Text>Hello world</Text>
</Box>
```

##### borderRightColor

Type: `string`

Change right border color.
Accepts the same values as [`color`](#color) in `<Text>` component.

```jsx
<Box borderStyle="round" borderRightColor="green">
	<Text>Hello world</Text>
</Box>
```

##### borderBottomColor

Type: `string`

Change bottom border color.
Accepts the same values as [`color`](#color) in `<Text>` component.

```jsx
<Box borderStyle="round" borderBottomColor="green">
	<Text>Hello world</Text>
</Box>
```

##### borderLeftColor

Type: `string`

Change left border color.
Accepts the same values as [`color`](#color) in `<Text>` component.

```jsx
<Box borderStyle="round" borderLeftColor="green">
	<Text>Hello world</Text>
</Box>
```

##### borderDimColor

Type: `boolean`\
Default: `false`

Dim the border color.
Shorthand for setting `borderTopDimColor`, `borderBottomDimColor`, `borderLeftDimColor` and `borderRightDimColor`.

```jsx
<Box borderStyle="round" borderDimColor>
	<Text>Hello world</Text>
</Box>
```

##### borderTopDimColor

Type: `boolean`\
Default: `false`

Dim the top border color.

```jsx
<Box borderStyle="round" borderTopDimColor>
	<Text>Hello world</Text>
</Box>
```

##### borderBottomDimColor

Type: `boolean`\
Default: `false`

Dim the bottom border color.

```jsx
<Box borderStyle="round" borderBottomDimColor>
	<Text>Hello world</Text>
</Box>
```

##### borderLeftDimColor

Type: `boolean`\
Default: `false`

Dim the left border color.

```jsx
<Box borderStyle="round" borderLeftDimColor>
	<Text>Hello world</Text>
</Box>
```

##### borderRightDimColor

Type: `boolean`\
Default: `false`

Dim the right border color.

```jsx
<Box borderStyle="round" borderRightDimColor>
	<Text>Hello world</Text>
</Box>
```

##### borderTop

Type: `boolean`\
Default: `true`

Determines whether top border is visible.

##### borderRight

Type: `boolean`\
Default: `true`

Determines whether right border is visible.

##### borderBottom

Type: `boolean`\
Default: `true`

Determines whether bottom border is visible.

##### borderLeft

Type: `boolean`\
Default: `true`

Determines whether left border is visible.

### `<Newline>`

Adds one or more newline (`\n`) characters.
Must be used within `<Text>` components.

#### count

Type: `number`\
Default: `1`

Number of newlines to insert.

```jsx
import {render, Text, Newline} from 'ink';

const Example = () => (
	<Text>
		<Text color="green">Hello</Text>
		<Newline />
		<Text color="red">World</Text>
	</Text>
);

render(<Example />);
```

Output:

```
Hello
World
```

### `<Spacer>`

A flexible space that expands along the major axis of its containing layout.
It's useful as a shortcut for filling all the available spaces between elements.

For example, using `<Spacer>` in a `<Box>` with default flex direction (`row`) will position "Left" on the left side and will push "Right" to the right side.

```jsx
import {render, Box, Text, Spacer} from 'ink';

const Example = () => (
	<Box>
		<Text>Left</Text>
		<Spacer />
		<Text>Right</Text>
	</Box>
);

render(<Example />);
```

In a vertical flex direction (`column`), it will position "Top" to the top of the container and push "Bottom" to the bottom of it.
Note, that container needs to be tall to enough to see this in effect.

```jsx
import {render, Box, Text, Spacer} from 'ink';

const Example = () => (
	<Box flexDirection="column" height={10}>
		<Text>Top</Text>
		<Spacer />
		<Text>Bottom</Text>
	</Box>
);

render(<Example />);
```

### `<Static>`

`<Static>` component permanently renders its output above everything else.
It's useful for displaying activity like completed tasks or logs - things that
are not changing after they're rendered (hence the name "Static").

It's preferred to use `<Static>` for use cases like these, when you can't know
or control the amount of items that need to be rendered.

For example, [Tap](https://github.com/tapjs/node-tap) uses `<Static>` to display
a list of completed tests. [Gatsby](https://github.com/gatsbyjs/gatsby) uses it
to display a list of generated pages, while still displaying a live progress bar.

```jsx
import React, {useState, useEffect} from 'react';
import {render, Static, Box, Text} from 'ink';

const Example = () => {
	const [tests, setTests] = useState([]);

	useEffect(() => {
		let completedTests = 0;
		let timer;

		const run = () => {
			// Fake 10 completed tests
			if (completedTests++ < 10) {
				setTests(previousTests => [
					...previousTests,
					{
						id: previousTests.length,
						title: `Test #${previousTests.length + 1}`
					}
				]);

				timer = setTimeout(run, 100);
			}
		};

		run();

		return () => {
			clearTimeout(timer);
		};
	}, []);

	return (
		<>
			{/* This part will be rendered once to the terminal */}
			<Static items={tests}>
				{test => (
					<Box key={test.id}>
						<Text color="green">✔ {test.title}</Text>
					</Box>
				)}
			</Static>

			{/* This part keeps updating as state changes */}
			<Box marginTop={1}>
				<Text dimColor>Completed tests: {tests.length}</Text>
			</Box>
		</>
	);
};

render(<Example />);
```

**Note:** `<Static>` only renders new items in `items` prop and ignores items
that were previously rendered. This means that when you add new items to `items`
array, changes you make to previous items will not trigger a rerender.

See [examples/static](examples/static/static.tsx) for an example usage of `<Static>` component.

#### items

Type: `Array`

Array of items of any type to render using a function you pass as a component child.

#### style

Type: `object`

Styles to apply to a container of child elements.
See [`<Box>`](#box) for supported properties.

```jsx
<Static items={...} style={{padding: 1}}>
	{...}
</Static>
```

#### children(item)

Type: `Function`

Function that is called to render every item in `items` array.
First argument is an item itself and second argument is index of that item in
`items` array.

Note that `key` must be assigned to the root component.

```jsx
<Static items={['a', 'b', 'c']}>
	{(item, index) => {
		// This function is called for every item in ['a', 'b', 'c']
		// `item` is 'a', 'b', 'c'
		// `index` is 0, 1, 2
		return (
			<Box key={index}>
				<Text>Item: {item}</Text>
			</Box>
		);
	}}
</Static>
```

### `<Transform>`

Transform a string representation of React components before they are written to output.
For example, you might want to apply a [gradient to text](https://github.com/sindresorhus/ink-gradient), [add a clickable link](https://github.com/sindresorhus/ink-link) or [create some text effects](https://github.com/sindresorhus/ink-big-text).
These use cases can't accept React nodes as input, they are expecting a string.
That's what `<Transform>` component does, it gives you an output string of its child components and lets you transform it in any way.

**Note:** `<Transform>` must be applied only to `<Text>` children components and shouldn't change the dimensions of the output, otherwise layout will be incorrect.

```jsx
import {render, Transform} from 'ink';

const Example = () => (
	<Transform transform={output => output.toUpperCase()}>
		<Text>Hello World</Text>
	</Transform>
);

render(<Example />);
```

Since `transform` function converts all characters to upper case, final output that's rendered to the terminal will be "HELLO WORLD", not "Hello World".

When the output wraps to multiple lines, it can be helpful to know which line is being processed.

For example, to implement a hanging indent component, you can indent all the lines except for the first.

```jsx
import {render, Transform} from 'ink';

const HangingIndent = ({content, indent = 4, children, ...props}) => (
	<Transform
		transform={(line, index) =>
			index === 0 ? line : ' '.repeat(indent) + line
		}
		{...props}
	>
		{children}
	</Transform>
);

const text =
	'WHEN I WROTE the following pages, or rather the bulk of them, ' +
	'I lived alone, in the woods, a mile from any neighbor, in a ' +
	'house which I had built myself, on the shore of Walden Pond, ' +
	'in Concord, Massachusetts, and earned my living by the labor ' +
	'of my hands only. I lived there two years and two months. At ' +
	'present I am a sojourner in civilized life again.';

// Other text properties are allowed as well
render(
	<HangingIndent bold dimColor indent={4}>
		{text}
	</HangingIndent>
);
```

#### transform(outputLine, index)

Type: `Function`

Function which transforms children output.
It accepts children and must return transformed children too.

##### children

Type: `string`

Output of child components.

##### index

Type: `number`

The zero-indexed line number of the line currently being transformed.

## Hooks

### useInput(inputHandler, options?)

This hook is used for handling user input.
It's a more convenient alternative to using `useStdin` and listening to `data` events.
The callback you pass to `useInput` is called for each character when user enters any input.
However, if user pastes text and it's more than one character, the callback will be called only once and the whole string will be passed as `input`.
You can find a full example of using `useInput` at [examples/use-input](examples/use-input/use-input.tsx).

```jsx
import {useInput} from 'ink';

const UserInput = () => {
	useInput((input, key) => {
		if (input === 'q') {
			// Exit program
		}

		if (key.leftArrow) {
			// Left arrow key pressed
		}
	});

	return …
};
```

#### inputHandler(input, key)

Type: `Function`

The handler function that you pass to `useInput` receives two arguments:

##### input

Type: `string`

The input that the program received.

##### key

Type: `object`

Handy information about a key that was pressed.

###### key.leftArrow

###### key.rightArrow

###### key.upArrow

###### key.downArrow

Type: `boolean`\
Default: `false`

If an arrow key was pressed, the corresponding property will be `true`.
For example, if user presses left arrow key, `key.leftArrow` equals `true`.

###### key.return

Type: `boolean`\
Default: `false`

Return (Enter) key was pressed.

###### key.escape

Type: `boolean`\
Default: `false`

Escape key was pressed.

###### key.ctrl

Type: `boolean`\
Default: `false`

Ctrl key was pressed.

###### key.shift

Type: `boolean`\
Default: `false`

Shift key was pressed.

###### key.tab

Type: `boolean`\
Default: `false`

Tab key was pressed.

###### key.backspace

Type: `boolean`\
Default: `false`

Backspace key was pressed.

###### key.delete

Type: `boolean`\
Default: `false`

Delete key was pressed.

###### key.pageDown

###### key.pageUp

Type: `boolean`\
Default: `false`

If Page Up or Page Down key was pressed, the corresponding property will be `true`.
For example, if user presses Page Down, `key.pageDown` equals `true`.

###### key.meta

Type: `boolean`\
Default: `false`

[Meta key](https://en.wikipedia.org/wiki/Meta_key) was pressed.

#### options

Type: `object`

##### isActive

Type: `boolean`\
Default: `true`

Enable or disable capturing of user input.
Useful when there are multiple `useInput` hooks used at once to avoid handling the same input several times.

### useApp()

`useApp` is a React hook, which exposes a method to manually exit the app (unmount).

#### exit(error?)

Type: `Function`

Exit (unmount) the whole Ink app.

##### error

Type: `Error`

Optional error. If passed, [`waitUntilExit`](waituntilexit) will reject with that error.

```js
import {useApp} from 'ink';

const Example = () => {
	const {exit} = useApp();

	// Exit the app after 5 seconds
	useEffect(() => {
		setTimeout(() => {
			exit();
		}, 5000);
	}, []);

	return …
};
```

### useStdin()

`useStdin` is a React hook, which exposes stdin stream.

#### stdin

Type: `stream.Readable`\
Default: `process.stdin`

Stdin stream passed to `render()` in `options.stdin` or `process.stdin` by default.
Useful if your app needs to handle user input.

```js
import {useStdin} from 'ink';

const Example = () => {
	const {stdin} = useStdin();

	return …
};
```

#### isRawModeSupported

Type: `boolean`

A boolean flag determining if the current `stdin` supports `setRawMode`.
A component using `setRawMode` might want to use `isRawModeSupported` to nicely fall back in environments where raw mode is not supported.

```jsx
import {useStdin} from 'ink';

const Example = () => {
	const {isRawModeSupported} = useStdin();

	return isRawModeSupported ? (
		<MyInputComponent />
	) : (
		<MyComponentThatDoesntUseInput />
	);
};
```

#### setRawMode(isRawModeEnabled)

Type: `function`

##### isRawModeEnabled

Type: `boolean`

See [`setRawMode`](https://nodejs.org/api/tty.html#tty_readstream_setrawmode_mode).
Ink exposes this function to be able to handle <kbd>Ctrl</kbd>+<kbd>C</kbd>, that's why you should use Ink's `setRawMode` instead of `process.stdin.setRawMode`.

**Warning:** This function will throw unless the current `stdin` supports `setRawMode`. Use [`isRawModeSupported`](#israwmodesupported) to detect `setRawMode` support.

```js
import {useStdin} from 'ink';

const Example = () => {
	const {setRawMode} = useStdin();

	useEffect(() => {
		setRawMode(true);

		return () => {
			setRawMode(false);
		};
	});

	return …
};
```

### useStdout()

`useStdout` is a React hook, which exposes stdout stream, where Ink renders your app.

#### stdout

Type: `stream.Writable`\
Default: `process.stdout`

```js
import {useStdout} from 'ink';

const Example = () => {
	const {stdout} = useStdout();

	return …
};
```

#### write(data)

Write any string to stdout, while preserving Ink's output.
It's useful when you want to display some external information outside of Ink's rendering and ensure there's no conflict between the two.
It's similar to `<Static>`, except it can't accept components, it only works with strings.

##### data

Type: `string`

Data to write to stdout.

```js
import {useStdout} from 'ink';

const Example = () => {
	const {write} = useStdout();

	useEffect(() => {
		// Write a single message to stdout, above Ink's output
		write('Hello from Ink to stdout\n');
	}, []);

	return …
};
```

See additional usage example in [examples/use-stdout](examples/use-stdout/use-stdout.tsx).

### useStderr()

`useStderr` is a React hook, which exposes stderr stream.

#### stderr

Type: `stream.Writable`\
Default: `process.stderr`

Stderr stream.

```js
import {useStderr} from 'ink';

const Example = () => {
	const {stderr} = useStderr();

	return …
};
```

#### write(data)

Write any string to stderr, while preserving Ink's output.

It's useful when you want to display some external information outside of Ink's rendering and ensure there's no conflict between the two.
It's similar to `<Static>`, except it can't accept components, it only works with strings.

##### data

Type: `string`

Data to write to stderr.

```js
import {useStderr} from 'ink';

const Example = () => {
	const {write} = useStderr();

	useEffect(() => {
		// Write a single message to stderr, above Ink's output
		write('Hello from Ink to stderr\n');
	}, []);

	return …
};
```

## API

#### render(tree, options?)

Returns: [`Instance`](#instance)

Mount a component and render the output.

##### tree

Type: `ReactElement`

##### options

Type: `object`

###### stdout

Type: `stream.Writable`\
Default: `process.stdout`

Output stream where app will be rendered.

###### stdin

Type: `stream.Readable`\
Default: `process.stdin`

Input stream where app will listen for input.

###### exitOnCtrlC

Type: `boolean`\
Default: `true`

Configure whether Ink should listen to Ctrl+C keyboard input and exit the app.
This is needed in case `process.stdin` is in [raw mode](https://nodejs.org/api/tty.html#tty_readstream_setrawmode_mode), because then Ctrl+C is ignored by default and process is expected to handle it manually.

###### patchConsole

Type: `boolean`\
Default: `true`

Patch console methods to ensure console output doesn't mix with Ink output.
When any of `console.*` methods are called (like `console.log()`), Ink intercepts their output, clears main output, renders output from the console method and then rerenders main output again.
That way both are visible and are not overlapping each other.

This functionality is powered by [patch-console](https://github.com/vadimdemedes/patch-console), so if you need to disable Ink's interception of output but want to build something custom, you can use it.

###### debug

Type: `boolean`\
Default: `false`

If `true`, each update will be rendered as a separate output, without replacing the previous one.

#### Instance

This is the object that `render()` returns.

##### rerender(tree)

Replace previous root node with a new one or update props of the current root node.

###### tree

Type: `ReactElement`

```jsx
// Update props of the root node
const {rerender} = render(<Counter count={1} />);
rerender(<Counter count={2} />);

// Replace root node
const {rerender} = render(<OldCounter />);
rerender(<NewCounter />);
```

##### unmount()

Manually unmount the whole Ink app.

```jsx
const {unmount} = render(<MyApp />);
unmount();
```

##### waitUntilExit()

Returns a promise, which resolves when app is unmounted.

```jsx
const {unmount, waitUntilExit} = render(<MyApp />);

setTimeout(unmount, 1000);

await waitUntilExit(); // resolves after `unmount()` is called
```

##### clear()

Clear output.

```jsx
const {clear} = render(<MyApp />);
clear();
```

#### measureElement(ref)

Measure the dimensions of a particular `<Box>` element.
It returns an object with `width` and `height` properties.
This function is useful when your component needs to know the amount of available space it has. You could use it when you need to change the layout based on the length of its content.

**Note:** `measureElement()` returns correct results only after the initial render, when layout has been calculated. Until then, `width` and `height` equal to zero. It's recommended to call `measureElement()` in a `useEffect` hook, which fires after the component has rendered.

##### ref

Type: `MutableRef`

A reference to a `<Box>` element captured with a `ref` property.
See [Refs](https://reactjs.org/docs/refs-and-the-dom.html) for more information on how to capture references.

```jsx
import {render, measureElement, Box, Text} from 'ink';

const Example = () => {
	const ref = useRef();

	useEffect(() => {
		const {width, height} = measureElement(ref.current);
		// width = 100, height = 1
	}, []);

	return (
		<Box width={100}>
			<Box ref={ref}>
				<Text>This box will stretch to 100 width</Text>
			</Box>
		</Box>
	);
};

render(<Example />);
```

#### Focus

Focus is derived from the context provided by `Page`, `List`, `Node`, and
`Modal` components. A component that has no context from any of these providers is
assumed to be in focus, whereas if context is available, the component is
considered focused only if all of its providers are also focused. Shallow focus
exists for leaf nodes that are focused relative to a parent that is not deeply
focused.

```
Root *focus by default*
│
Pages *focus*
│
├───── Page *focus*
│      │
│      ├──────── List *focus*
│      │         │
│      │         ├───────── List Item *focus*
│      │         ├───────── List Item
│      │         ├───────── List Item
│      │         └───────── List Item
│      │
│      │
│      └──────── List
│                │
│                ├───────── List Item *shallow-focus*
│                ├───────── List Item
│                ├───────── List Item
│                └───────── List Item
│
└───── Page
       │
       │
       ├──────── Node *shallow-focus*
       │         │
       │         └──────── List *shallow-focus*
       │                   │
       │                   ├───────── List Item *shallow-focus*
       │                   ├───────── List Item
       │                   ├───────── List Item
       │                   └───────── List Item
       │
       └──────── Node
                 │
                 └──────── List *shallow-focus*
                           │
                           ├───────── List Item *shallow-focus*
                           ├───────── List Item
                           ├───────── List Item
                           └───────── List Item
```

#### Events

Events can be emitted with the `useKeymap` hook and responded to anywhere in the
app with the `useEvent` hook. Both of these hooks are only active if the
component dispatching them is deeply focused. On every standard input event,
every active useKeymap hook processes its `KeyMap` object and will emit an event
if there is a match. Once an event has been emitted, all hooks are blocked from
processing until the next standard input event.

```typescript
const { useEvent } = useKeymap({
	foo: { input: "f" },
	bar: { input: "b" },
});
useEvent("foo", () => {
	/* ... */
});
useEvent("bar", () => {
	/* ... */
});
```

#### Navigation

`Pages`, `Lists`, `Node`, and `Modal` components display the state of focus in
the app. Each of these core components has a corresponding hook that manages the
focus state and returns utilities that help control navigation.

- _Pages / usePages_

```typescript
const { pageView, control } = usePages(3);

const { useEvent } = useKeymap({
	goToPage: [
		{ input: "1" },
		{ input: "2" },
		{ input: "3" },
	]
});

useEvent("goToPage", (char) => {
	const pageNumber = Number(char);
	if (!Number.isNaN) {
		control.goToPage(pageNumber);
	}
});

return (
	<Viewport>
		<Pages pageView={pageView}>
		<PageOne />
		<PageTwo />
		<PageThree />
	</Viewport>
);
```

- _Lists / useList_ (1d navigation)

```typescript
const { listView, items } = useList(["foo", "bar", "baz"], {
	navigation: "vi-vertical",
});

return  (
	<Box height="50" width="50" borderStyle="round">
		<List listView={listView}>
			{items.map(item => <Text key={item}></Text>)}
		</List>
	</Box>

);
```

- _Node / useNodeMap_ (2d navigation)

```typescript
const nodeMap = [
	["1", "2"],
	["3", "3"],
];

const { register } = useNodeMap(nodeMap, { navigation: "vi" });

return (
	<Box height="100" width="100" flexDirection="column">
		<Box height="100" width="100" flexDirection="row">
			<Node {...register("1")}>
				<NodeOne />
			</Node>
			<Node {...register("2")}>
				<NodeTwo />
			</Node>
		</Box>
		<Box height="100" width="100">
			<Node {...register("3")}>
				<NodeThree />
			</Node>
		</Box>
	</Box>
)
```

- _Modal / useModal_

```typescript
const { modal, showModal } = useModal({
	show: { key: "?" }, // ? because maybe this is a help modal?
	hide: { key: "esc" },
});

return (
	<Viewport>
		<MainApp />
		<Modal
			modal={modal}
			height="50"
			width="50"
			borderStyle="round"
			justifySelf="center"
			alignSelf="center"
		>
			{ /* modal content */ }
		</Modal>
	</Viewport>
)
```

---

## Settings

#### setCharRegisterSize: (num: number): void

By default, input stores up to 2 non-alphanumeric chars before resetting to an
empty string. Once an event is emitted, the register resets again. If this
default size of 2 is not desired, you can set it with the `setCharRegisterSize`
size which accepts any positive number as an argument. The `StdinState`
component offers visual feedback for the char register and events that are
emitted.

#### setMouseReporting(b: boolean): void

This function tells the app to listen for mouse input events. Set to `false` by
default, this should only be set if the app is using the `Viewport` component,
as mouse events are receieved relative to the **entire** terminal screen, not
just the dimensions of the app.

#### preserveScreen(): void

Call this function before your app renders anything and when your app closes it
will return your terminal screen to the original state before the app started.

```typescript
preserveScreen();
render(<App />)
```

#### Throttle rendering

Throttle renders to at most once every _throttleMs_

```typescript
render(<App />, { throttle: 8 })
```

<!-- preserve-screen-demo.mp4 -->
<!-- github refuses to NOT embed this -->
<!-- [demo](https://github.com/user-attachments/assets/194b1789-b189-42e2-bc02-268d655d2a47) -->

#### setConsole({ enabled: boolean; path: string }): void

Call this function to configure the behavior of console.log statements in the
app. This can be helpful if you are using the `Viewport` component, which will
obscure any stdout coming from the nodejs console object.

```typescript
setConsole({ enabled: true, path: "console.log" });
```

The above example sends all output from the console to a file named
"console.log". You can then watch that file with something like `tail --follow
console.log`.

#### Logger

Log to a specified file. Allows you to have multiple log files instead of just
the specified path in setConsole.

```typescript
const logger = new Logger();
logger.file("server.log").color("green").write("[RESPONSE]: 200");
```

`file` can be also be set with `logger.setFile(file)`

---

## Lists

```typescript
const initGroceryList = [
    "Bananas", "Eggs", "Milk", "Bread", "Chicken breast",
    "Spinach", "Butter", "Rice", "Cheese", "Cereal"
];

const { listView, items } = useList(initGroceryList, {
    windowSize: "fit",
    unitSize: 1,
    navigation: "vi-vertical",
    centerScroll: false,
    fallthrough: false,
});

return (
    <Box
        height={5}
        width={20}
        borderStyle="round"
        titleTopCenter={{ title: " Groceries " }}
    >
        <List listView={listView}>
            {items.map((item) => (
                <Item key={item} />
            ))}
        </List>
    </Box>
);

function Item(): React.ReactNode {
    const { isFocus, item } = useListItem<string[]>();
    const color = isFocus ? "blue" : undefined;
    return (
        <Box width="100" backgroundColor={color}>
            <Text wrap="truncate-end">{item}</Text>
        </Box>
    );
}
```

<!-- list demo -->

https://github.com/user-attachments/assets/a0d684c2-1023-4149-84f6-fdd7b187785b

### useList(itemsOrLength, Options): { listView, control, items, setItems }

#### itemsOrLength: any[] | number

- If an array argument is provided, useList will manage state for you. A number
  argument states how many items will be included in the list.

#### Options:

- `windowSize: "fit" | number`

    - Default: 'fit'
    - `'fit'`: Maximizes the number of list items displayed within the available
      cross-sectional space, based on the `unitSize` value. When windowSize is set
      to 'fit', unitSize defaults to 1.
    - `number`: Sets the window size explicitly, up to the lesser of the provided
      number and the total number of list items. This option is most effective
      when paired with a unitSize of `stretch`. unitSize defaults to
      'stretch' when windowSize is set to a number.

- `unitSize: number | 'stretch' | 'fit-unit'`

    - Default: Defaults to 1 when windowSize is 'fit'. Defaults to 'stretch'
      when windowSize is a number.
    - `number`: Assumes a fixed size for each list item's cross-sectional
      dimension. Displays as many items as possible based on this size.
    - `'stretch'`: Dynamically adjusts the size of the list items to fit within
      the available space. If windowSize is 'fit', displays as many possible
      items as possible and adjusts the size to shrink dynamically, down to a
      minimum unitSize of 1.
        - `'fit-unit'`: When rendering the list item, the dimensions of the item's
          container are the size of the list item itself. This might be helpful in
          the case you wanted a list with a window size of 1, but each item to have
          a different size. Otherwise, the container is stretched to fill available
          space.

- `navigation: 'none' | 'vi-vertical' | 'vi-horizontal' | 'arrow-vertical' |
'arrow-horizontal'`

    - Default: 'vi-vertical'
    - `'none'`: No keymaps will control the list for you. You can control
      navigation in the list with the `control` object returned from useList along
      with `useEvent`/`useKeymap`.
    - `'vi-vertical'`: 'j': down, 'k': up, 'ctrl+d': scroll down half window,
      'ctrl+u': scroll up half window, 'gg': go to first index, 'G': go to last
      index, arrow keys also supported.
    - `'vi-horizontal'`: 'h': left, 'l': right, arrow keys also supported.
    - `'arrow-vertical'`: 'up': up, 'down': down.
    - `'arrow-horizontal'`: 'left': left, 'right': right.
    - `*NOTE:*` If a component contains more than one List and they both contain
      default navigation keymaps, behavior will be unpredictable.

- `centerScroll: boolean`
    - Default: 'false'
    - Keeps the focused item in the center of the visible window slice when
      possible. This could be useful when a scrollbar isn't desired because it
      provides feedback when at the start/end of lists because the focused item
      will shift out of center.

<!-- list centerscroll demo -->

https://github.com/user-attachments/assets/ec816010-4d9f-46bc-a043-2f132569be03

- `fallthrough: boolean`
    - Default: 'false'
    - Controls navigation behavior at list boundaries. If `true`, when focus
      reaches the end of the list, wraps around to the opposite end. If `false`,
      focus stops at the list boundaries and cannot move further.

<!-- list fallthrough demo -->

https://github.com/user-attachments/assets/869bae25-8cd5-43cc-bbac-0d8f9c6312e3

#### Return: { listView, control, items, setItems }

- `listView`: Required prop for List component.
- `control`: Utilities for controlling the list:

    - `currentIndex: number`: The current index that is focused.
    - `goToIndex(nextIdx: number, center?: boolean): void`: Shifts focus to a
      given index. If `center` is true, center the focus if possible.
    - `nextItem(): void`: Shift focus to the next list item.
    - `prevItem(): void`: Shift focus to the previous list item.
    - `scrollDown(n?: number): void`: Shifts focus down `n` items. If a number is
      not provided, shifts focus down half of the viewing slice.
    - `scrollUp(n?: number): void`: Opposite of scrollDown.

- `items, setItems`:
    - If an array was provided, these are the state related variables managed
      internally by `useList`.
    - If an array was not provided, items defaults to a dummy array of `null`.

---

### List

The component responsible for displaying the state of the list. The List
component has a height and width of 100% of its parent container, so it needs a
parent container to inherit dimensions from. If a column List has a height of
0, then no list items will be rendered.

#### Required Props:

- `listView`: The object received from useList

#### Optional Props

- `flexDirection: 'row' | 'column'`: 'column' renders the list items vertically,
  while 'row' renders the list items horizontally
    - Default: 'column'
- `scrollbar`: Value is a config object that styles the scrollbar
    - `hide?: boolean`: Show or hide the scrollbar
        - Default: 'false'
    - `color?: string`: Color of the scrollbar
        - Default: 'undefined'
    - `dimColor?: boolean`:
        - Default: `false`
    - `style?: 'single' | 'bold' : { char: string }`: The thickness of the
      scrollbar. Add your own style with the config object option
    - `align?: 'start' | 'end'` 'start' aligns on the left and top of
      column and row lists respectively and 'end' the right and bottom. - Default: `end`
- `justifyContent: 'flex-start' | 'center' | flex-end' | 'space-between' |
'space-around'`: Control how the list items are displayed within the viewing
  window.
    - Default: 'flex-start'
- `alignItems: 'flex-start' | 'center' | 'flex-end' | 'stretch'`: Control how the list
  items are displayed within the viewing window. - Default: 'flex-start'
- `gap: number`: The `gap` between list items.
    - Default: '0'
- `batchMap`: `batchMap?: { batchSize?: number; items: T[]; map: (item: T, index: number) => ReactNode; };`
    - Default `batchSize`: 250

#### batchMap

If performance becomes an issue with _excessively_ large lists, render list items
within the `map` callback _instead of_ how you would normally list render
something within the JSX. This renders only the `batchSize` of items.

```typescript
batchMap={{
	batchSize: 100,
	items: myLongList as Foo[],
	map: (item, index) => {
		return <Item key={item} item={item} />;
	},
}}
```

**Note**: In the example, any state local to the `Item` component is lost once
it goes out of the viewing window. This is only the case for `batchMap`.
List items rendered normally always stay mounted and therefore maintain state.

---

### useListItem<T>(): { item, items, setItems, onFocus, onBlur, itemIndex, listIndex, control, isFocus, isShallowFocus }

Returns data about the list-rendered component and the list.

#### Generic Argument:

- `<T>`: Represents the type of the items array.
    - Default: 'any[]'

#### Properties:

- `item`: If the value passed to useList was a number representing the length,
  this will be `null`, otherwise it will be the corresponding value in the
  'items' array for this list item.
- `items`: The array responsible for rendering the list items. If the value
  passed to useList was a number representing the length, this will be an array
  of `null`.
- `setItems`: State action for updating the list items. If the `useList`
  hook is managing the state of the provided array, this is the setState
  function.
- `onFocus`: A function that accepts a callback that is executed every time this
  component comes into deep focus.
- `onBlur`: A function that accepts a callback that is executed every time this
  component becomes unfocused.
- `itemIndex`: The index of this node within the 'items' array.
- `listIndex`: The currently focused index in the 'items' array.
- `isFocus`: 'true' if the index of this node matches the currently focused
  index in the list _and_ the List itself is also focused.
- `isShallowFocus`: 'true' if the node is focused relative to the List, but
  the List itself is not focused.
- `control`: The `control` object containing utilities for controlling the
  list.

---

### List: windowSize and unitSize examples

#### Fixed windowSize with unitSize of 'stretch'.

`Note:` When windowSize is a `number`, unitSize will default to `stretch`.

```typescript
const { listView, items, control } = useList(initGroceryList, {
	windowSize: 2,
	unitSize: "stretch",
});

return (
	<Box
		height={8}
		width={20}
		borderStyle="round"
		titleTopCenter={{ title: " Groceries " }}
	>
		<List listView={listView}>
			{items.map((item) => {
				return <Item key={item} />;
			})}
		</List>
	</Box>
);

function Item(): React.ReactNode {
    const { isFocus, item } = useListItem<string[]>();
    const color = isFocus ? "blue" : undefined;
    return (
        <Box width="100" height="100" backgroundColor={color}>
            <Text wrap="truncate-end">{item}</Text>
        </Box>
    );
}
```

<!-- demo-fixed-window-stretch-unit.mp4 -->

https://github.com/user-attachments/assets/55204fc7-914a-4f7e-a2d0-af3cd99f54b2

---

#### 'fit' windowSize with fixed unitSize.

`Note:` When windowSize is set to `fit`, unitSize defaults to `1`

If unitSize is a fixed number, then all list items are assumed to have that
dimension. Excess height could lead to improper fit. This is why the wrap
property is set to 'truncate-end' in the Text component.

```typescript
const { listView, items } = useList(initGroceryList, {
	windowSize: "fit",
	unitSize: 3,
});

return (
	<Box
		height={11}
		width={20}
		borderStyle="round"
		titleTopCenter={{ title: " Groceries " }}
	>
		<List listView={listView}>
			{items.map((item) => {
				return <Item key={item} />;
			})}
		</List>
	</Box>
);

function Item(): React.ReactNode {
    const { isFocus, item } = useListItem<string[]>();
    const color = isFocus ? "blue" : undefined;
    return (
        <Box
            width="100"
            borderStyle="round"
            backgroundColor={color}
            borderColor={color}
        >
            <Text wrap="truncate-end">{item}</Text>
        </Box>
    );
}
```

<!-- demo-fit-window-fixed-unit.mp4 -->

https://github.com/user-attachments/assets/e5eb2f04-cc96-4d26-98fc-03f5fbab4457

---

## useKeymap, useEvent, useInput

This example continues on from the `List` example.

`Note`: useEvent can also be imported, but you lose autocomplete unless a
generic argument is provided. The generic must satisfy the `KeyMap` type.

```typescript
function Item(): React.ReactNode {
    const { isFocus, item, items, setItems, index } = useListItem<string[]>();

    const [checked, setChecked] = useState(false);

    const { useEvent } = useKeymap({
        toggleChecked: { key: "return" },
        deleteItem: { input: "dd" },
    });

    useEvent("toggleChecked", () => {
        setChecked(!checked);
    });

    useEvent("deleteItem", () => {
        const itemsCopy = items.slice();
        itemsCopy.splice(index, 1);
        setItems(itemsCopy);
    });

    const color = isFocus ? "blue" : undefined;
    return (
        <Box width="100" backgroundColor={color}>
            <Text wrap="truncate-end">{`${item} ${checked ? "✔" : " "}`}</Text>
        </Box>
    );
}
```

All events are derived from the same standard input stream. Once an event has
been matched, it is emitted and all other useKeymap hooks are blocked until the
next standard input event.

---

#### useKeymap(KeyMap, Opts): { useEvent }

```typescript
const keymap = {
	quit: { input: "q" },
	foobar: { input: "fb" },
} satisfies KeyMap;

useKeymap(keymap);
```

If the component is focused, useKeymap processes its KeyMap and emits events
with `node:events`. Any `useEvent` hook that is focused within the app can
respond to these events.

Beyond handling localized keymaps and events, useKeymap can be placed at the top
level of the app and provide events that are relevant at different scopes.

---

#### KeyMap: { [eventName: string]: KeyInput | KeyInput[] }

The keys in the KeyMap object are the names of the events that will be emitted
when standard input matches the KeyInput.

- `KeyInput`: { key?: Key; input?: string; notKey?: Key[]; notInput?: string[] }
    - `Key`: Non alphanumeric keys.
    - `input`: Any combination of alphanumeric keys.
    - `notKey`: Any input _except_ the Keys in this array will trigger this
      event.
    - `notInput`: Any input _except_ the strings in this array will trigger
      this event.

#### Opts

- `priority`: `never` | `always` | `default` | `override` | `textinput`
    - Default: 'default'
    - Sets priority levels for useKeymap hooks so that control can be passed
      between different hook instances. This is necessary for operations such
      as text input.
    - `always` and `never` do not interfere with other priority levels
    - `override` overrides anything set to default
    - `textinput` overrides everything including `always`

---

#### useEvent<T extends KeyMap>(eventName: keyof T, handler: (char: char) => unknown, additionalFocusCheck?: boolean = true): void

```typescript
useEvent<typeof keymap>("foo", () => {
	/* do something */
});
```

- `eventName`: The event derived from the keys of the `KeyMap` object
- `handler`: The last keypress that triggered the event.
- `additionalFocusCheck`: When 'false', the specific hook will not respond to
  any events.
    - Default: 'true'

---

#### useTypedEvent<T extends KeyMap>(): { useEvent<T> }

useEvent can be returned from the useKeymap hook, or it can be imported. If
imported, you need to provide the generic argument to receive autocomplete.
useTypedEvent returns a type-safe version of useEvent for better autocomplete.

```typescript
const keymap = { foo: { input: "f" } } satisfies KeyMap;
/* ... */
const { useEvent } = useTypedEvent<typeof keymap>();
```

---

#### useInput(handler: (input: string, key: Key) => unknown, opts?: Opts): void

```typescript
useInput(
	(input, key) => {
		if (key.return) {
			console.log("'Return' pressed");
		}
		if (input === "f") {
			console.log("'f' pressed");
		}
	},
	{ isActive: true, inputType: "char" },
);
```

Disregards focus and responds to standard input anywhere and anytime this hook
is dispatched. Functions the same as the `useInput` hook in
[Ink](https://github.com/vadimdemedes/ink). This is useful if you want to
escape the focus dependent response to standard input. Its also exists as a less
boilerplate option when focus isn't as much of a concern.

- **`isActive: boolean`**: Control whether or not the hooks read from standard input
- **`inputType: 'char' | 'register'`**: Controls what kind of `input` is recieved
    - Default: 'char'
    - `char`: Check input against single chars
    - `register`: Check input against however many chars are in the `char
register`.

---

## Pages

Pages are just Lists with a windowSize of 1 and unitSize of 'stretch'. There
are no default keymaps to control navigation of pages. If you want your app to
have different pages, you might also want to use the `Viewport` component which
is just a `Box` that uses the dimensions of the entire terminal screen.

```typescript
const pagesKeymap = {
    goToPage: [
        { input: "1" },
        { input: "2" }
    ],
    quit: { input: "q" },
} satisfies KeyMap;

export default function Docs(): React.ReactNode {
    const { pageView, control } = usePages(2);

    const { useEvent } = useKeymap(pagesKeymap);

    useEvent("goToPage", (char: string) => {
        const pageIndex = Number(char);

        if (!Number.isNaN(pageIndex)) {
            control.goToPage(pageIndex - 1);
        }
    });

    return (
        <Viewport>
            <Pages pageView={pageView}>
                <ListDemo />
                <PageTwo />
            </Pages>
        </Viewport>
    );
}
```

<!-- demo-pages.mp4 -->

https://github.com/user-attachments/assets/68700c6f-6a7f-47fc-945e-d76c887c42f8

### usePages(amountOfPages, Opts?): { pageView, control }

`amountOfPages: number`: The number of pages must match how many pages are rendered.

`Opts`: { fallthrough: boolean }

- Default: `false`
- The same as in the `useList` hook. If at the last page and
  `control.lastPage()` is executed, focus is shifted to the first page if is
  this option is true.

`pageView`: Required prop for `Pages` component.

`control`: Utilities for controlling the Pages component.

- `currentPage: number`: the current index that is focused.
- `goToPage(num: number): void`: Go to a page with specified index.
- `nextPage(): void`: Shift focus to the next page.
- `prevPage(): void`: Shift focus to the previous page.

### Pages (component)

#### Props:

`pageView`: The object received from `usePages`.

### usePage(): { control, isFocus, isShallowFocus, onPageFocus, onPageBlur }

- `control`: Utilities for controlling the `Pages` component. The same object
  received from usePages (plural).
- `isFocus: boolean / isShallowFocus: boolean`: Is this page focused/shallow
  focused?
- `onPageFocus`: A function that accepts a callback that is executed every time
  this page _gains_ focus.
- `onPageBlur`: A function that accepts a callback that is executed every time
  this page _loses_ focus.

---

## 2d Navigation: Node / useNodeMap

`useNodeMap` is a utility for managing 2-dimensional navigation. It maps nodes to
specific coordinates which enables intuitive navigation. Like Pages and Lists,
Nodes also provide focus context.

```typescript
const nodeMap = [
    ["A", "B"],
    ["C", "D"],
    ["", "E"],
] as const satisfies NodeMap;

function NodeMapDemo(): React.ReactNode {
    const { register, control } = useNodeMap(nodeMap, { navigation: "vi" });

    const { useEvent } = useKeymap({
        goToNode: [
            { input: "A" },
            { input: "B" },
            { input: "C" },
            { input: "D" },
            { input: "E" },
        ],
        next: { key: "tab" },
    });

    useEvent("goToNode", (char: string) => {
        control.goToNode(char);
    });

    useEvent("next", () => {
        control.next();
    });

    const styles: Styles["Box"] = {
        height: "100",
        width: "100",
        flexDirection: "row",
    };

    return (
        <Viewport flexDirection="column">
            <Box styles={styles}>
                <Node {...register("A")}>
                    <Square />
                </Node>
                <Node {...register("B")}>
                    <Square />
                </Node>
            </Box>
            <Box styles={styles}>
                <Node {...register("C")}>
                    <Square />
                </Node>
                <Node {...register("D")}>
                    <Square />
                </Node>
            </Box>
            <Box styles={styles}>
                <Box height="100" width="100"></Box>
                <Node {...register("E")}>
                    <Square />
                </Node>
            </Box>
        </Viewport>
    );
}

function Square(): React.ReactNode {
    const { isFocus, name } = useNode();

    const color = isFocus ? "blue" : undefined;

    return (
        <Box
            height="100"
            width="100"
            borderStyle="round"
            justifyContent="center"
            alignItems="center"
            borderColor={color}
            backgroundColor={color}
        >
            <Text>{name}</Text>
        </Box>
    );
}
```

<!-- node-map-demo.mp4 -->

https://github.com/user-attachments/assets/fb00a49e-fe0f-429e-8811-119e9315c952

#### useNode(nodeMap: NodeMap, opts? Opts): { register, control, nodesView, node }

**NodeMap**: This is the 2d string array that navigation is derived from. An
empty string is considered a `null` space in the `NodeMap`.

Maps do not need to follow a strict width. This is valid.

```typescript
const nodemap1 = [["1"], ["2", "3", "4"], ["5"]];
```

Nodes can extend cells. This is also valid.

```typescript
const nodemap2 = [
	["1", "2"],
	["1", "3"],
	["1", "4"],
];
```

**Opts: { initialFocus?: string; navigation?: 'vi' | 'arrow' | 'none' }**

- `initialFocus`: The name of the node that you want focused initially.
  If not provided, the first non-empty string is used.
- `navigation`: The default navigation keymaps provided.
    - Default: `vi`
    - `vi`: h,j,k,l and also arrow keys
    - `arrow`: arrow keys
    - `none`: Handle yourself with the `control` object

**Return: { register, control, nodesView, node }**

- `register(nodeName: string)`: The function used to register a `Node`
  component to the `NodeMap`. Not strictly necessary to use this
  function, but convenient. It returns `{ name: string; nodesView: NodeView
}` which are required props for the `Node` component
- `nodesView`: Required prop for the `Node` component.
- `node`: The name of the current node that is focused.
- `control`: Utilities for controlling the state of the map.
    - `next(): string`: Go to the next available node. This is like
      pressing tab in the browser when filling out a form. Returns the
      name of the focused node after the operation.
    - `prev(): string`: Opposite of `next`
    - `goToNode(node: string | number): string`: Shift focus directly to
      the provided node. If argument is a string, this should correlate to
      one of the nodes in the NodeMap. If argument is a number, this is the
      nth node in the map, if you were to count starting at the top left
      corner and ending at the bottom right corner.
    - `left(): string`: Shift focus left. Returns the name of the
      focused node after the operation after the operation.
    - `right(): string`: Shift focus right. Returns the name of the
      focused node after the operation after the operation.
    - `up(): string`: Shift focus up. Returns the name of the focused
      node after the operation after the operation.
    - `down(): string`: Shift focus down. Returns the name of the
      focused node after the operation after the operation.
    - `getSize(): number`: Returns the count of all the nodes.
    - `getLocation(): string`: The name of the currently focused node.
    - `getIteration(): number`: The _index_ of the currently focused
      node.

#### Node

Passes the state of the `NodeMap` to its child components, which includes the
focus status of the node with the given name.

```typescript
<Node nodesView={nodesView} name={"foo"}>
	<FooComponent />
</Node>
```

_or_

```typescript
<Node {...register("foo")}>
	<FooComponent />
</Node>
```

**Props**

`Required`:

- `nodesView`: The object returned from useNodeMap
- `name`: The name of the node.

#### `Node.Box`

Because it might be helpful or might lead to less jsx nesting in certain
situations, the `Node` component can be extended to include all of the props as
a `Box` component.

```typescript
<Node.Box nodesView={nodesView} name={"foo"} >
	<FooComponent />
</Node.Box>
```

#### useNode<T extends string = string>(): { name, isFocus, isShallowFocus, control}

Returns context about the `Node` we are rendering.

- `name`: The name of the Node we are rendering.
- `isFocus`: If the current Node is focused _and_ the component containing the
  `useNodeMap` hook is also focused.
- `isShallowFocus`: If the current Node is focused but the component
  containing the `useNodeMap` hook is _not_ focused.
- `control`: The same control object return from `useNodeMap`.

---

## Modals

```typescript
function ModalDemo(): React.ReactNode {
    const { modal } = useModal({
        show: { input: "m" },
        hide: { key: "esc" },
    });

    return (
        <>
            <Modal
                modal={modal}
                closeOnOutsideClick={true}
                justifySelf="center"
                alignSelf="center"

                // Normal Box props
                height="75"
                width="75"
                borderStyle="round"
                flexDirection="column"
                titleTopCenter={{ title: " Modal Demo " }}
            >
                <ModalContents />
            </Modal>
        </>
    );
}

function ModalContents(): React.ReactNode {
    const { hide } = useHideModal();

    return (
        <>
            <Text>Modal contents...</Text>
            <Text>To close:</Text>
            <Text>- Press Esc</Text>
            <Text>- Click outside this modal</Text>
            <Text>- Click the close button</Text>
            <Box onClick={hide} borderStyle="round" width="10">
                <Text>close</Text>
            </Box>
        </>
    );
}
```

<!-- modal-demo.mp4 -->

https://github.com/user-attachments/assets/507e3bc7-b036-45cc-9186-aebae9ae1f07

Modal components unfocus all components that are not themselves or their
children. Modals have a default `zIndex` of 1, but zIndex has no effect on
focus handling. A `Box` with a zIndex of 5 would still be unfocused when modal
component pops up if that Box is not a child of the modal.

---

#### useModal(ToggleKeymaps): { modal, showModal, hideModal }

`ToggleKeymaps: { show: KeyInput | KeyInput[] | null; hide: KeyInput | KeyInput[] | null
}`: The keymaps assigned to show and hide the modal. - If show or hide is assigned to `null`, then you'll need to show or hide
the modal with `showModal` or `hideModal`.

- `modal`: Required prop in the Modal component
- `showModal(): void`: Method other than assigning keymap to show the modal.
- `hideModal(): void`: Method other than assigning keymap to hide the modal.

#### useHideModal(): { hideModal }

Can be called within a Modal component to receive the `hideModal` function.

---

#### `Modal`:

- `Required Props`:
    - `modal`: Object returned from `useModal`
- `Props`:
    - `all of the props available to *Box* components are also available`
    - `justifySelf: 'flex-start | 'center' | flex-end`: Position the modal
      left/right within the parent element.
    - `alignSelf: 'flex-start' | 'center' | 'flex-end'`: Position the modal
      up/down within the parent element.
    - `xOffset: number / yOffset: number`: Fine tune the positioning relative to
      the parent element.

---

## TextInput / useTextInput

```typescript
function TextInputDemo(): React.ReactNode {
    const { onChange, setValue } = useTextInput("");

    const onExit = (value: string) => {
		/* do something with the value */
    };

	// Reset the value to '' every time we enter insert mode
    const onEnter = () => {
        setValue("");
    };

    return (
        <Box
            height="100"
            width="100"
            justifyContent="center"
            alignItems="center"
        >
            <Box borderStyle="round" width={10} height={3}>
                <TextInput
                    onChange={onChange}
                    enterKeymap={{ key: "return" }}
                    exitKeymap={{ key: "return" }}
                    onExit={onExit}
                    onEnter={onEnter}
                    textStyle={{
                        color: "magenta",
                    }}
                    cursorColor="green"
                    autoEnter
                />
            </Box>
        </Box>
    );
}
```

<!-- text-input-demo.mp4 -->

https://github.com/user-attachments/assets/2b88fefe-4436-42f4-b338-1357e86d8cbe

#### useTextInput(initialValue?: string): { onChange, value, setValue, insert, enterInsert }

- `onChange`: Function that is a required prop to the `TextInput` component.
- `value`: The current string value of the text.
- `setValue(nextValue: string, insert?: boolean)`: Utility function that
  updates the value to a specificed value
    - The optional `insert` defaults to not change whatever insert value it has
      currently, but when set explicitly, controls the insert value in the next
      state.
- `enterInsert()`: Utility function that puts you into insert mode.

#### TextInput

##### Required Props

- `onChange`: Function returned form `useTextInput`.

##### Optional Props

- `enterKeymap: KeyInput`:
    - Default: [{ key: "return" }, { input: "i" }]
- `exitKeymap: KeyInput`:
    - Default [{ key: "return" }, { key: "esc" }]
- `onExit(value: string, char: string)`: Allows you to do
  something with the value when exiting insert mode. - `char` is the key that triggered the TextInput to exit insert.
- `onEnter(value: string, char: string)`: Allows you to do something with
  the value when entering insert mode. - `char` is the key that triggered the TextInput to enter insert.
- `onKeypress(char: string)`: Called on every keypress event when inserting
  text.
- `onUpArrow() / onDownArrow()`: Control what happens when these keys are
  pressed while inserting text. Could be used to shift focus.
- `textStyles`: Style the displayed text
- `cursorColor`: Color the cursor block
- `autoEnter`: When focus is gained, does TextInput automatically enter
  insert mode?
    - Default: 'false'

---

## Box Styling

#### styles? Styles["Box"]

- Default: `undefined`
- This is an object that contains all of the styles available to `Box`
  components _except_ the `styles` prop. Useful in the case you have multiple
  boxes that need similar styles.

```typescript
const styles: Styles["Box"] = {
	height: 10,
	width: 10,
	justifyContent: "center",
	alignItems: "center",
	borderStyle: "round",
	borderColor: "blue",
};

return <Box styles={styles} borderColor="green"></Box>;
```

The above Box has a green border. Normal props overwrite the props in the styles
prop.

`Note`: Styles["Text"] exists for `Text` components as well.

---

#### backgroundColor?: string | 'inherit'

Colors the background color of a Box. When set to `inherit`, if the immediate
parent has a backgroundColor prop set, it will inherit from the parent.

- Default: `undefined`

---

#### titleTopLeft, titleTopCenter, titleTopRight, titleBottomLeft, titleBottomCenter, titleBottomRight

Applies a title in the specified location. The only required prop is `title`.
Nothing is styled unless explicitly set.

```typescript
<Box
	height={10}
	width={20}
	borderStyle="round"
	titleTopCenter={{
		title: " Title Demo ",
		color: "white",
		backgroundColor: "blue",
		dimColor: false,
		inverse: false,
		bold: true,
		italic: true,
	}}
></Box>
```

<!-- title-demo.png -->

![title-demo](https://github.com/user-attachments/assets/4b23fda2-3235-461c-9e26-34ea80c075ec)

---

#### zIndex?: 'auto' | number

- Default: `'auto' (equivalent to 0)`
- Sets the render order of a Box component. `zIndex` is only relative to the
  parent node, so a zIndex of 1 when the parent Box has a zIndex of 1 is really
  a zIndex of 2.

```typescript
<Box zIndex={1} styles={styles} backgroundColor="blue">
	<Text>z index of 1</Text>
</Box>
<Box
	zIndex={2}
	styles={styles}
	backgroundColor="yellow"
	marginLeft={10}
	marginTop={5}
>
	<Text>z index of 2</Text>
</Box>
```

<!-- zindex-demo.png -->

![zindex-demo](https://github.com/user-attachments/assets/a1d9269a-a4e1-4f58-9cb7-21941f1ceee1)

---

#### wipeBackground?: boolean

- Default: `false`
  Clears the background of a Box component. When a zIndex is set, this happens by
  default. Can be a drain on performance if this happens too often.

---

## Mouse Events

Mouse event handlers can be attached to `Box` components and to any
`titleTopLeft, titleTopCenter, etc...` prop object on a Box.

Requires manually telling the app to listen for mouse input events with the
`setMouseReporting(b: boolean)` function.

#### Important:

- Mouse events are only accurate if the app is using the entire terminal
  screen, so if you aren't using the Viewport component, clicks will not be
  accurate.

All handlers accept a callback in the form of `(e: MouseEvent) => unknown`.

- `onClick`
- `onDoubleClick`
- `onMouseDown`
- `onMouseUp`
- `onRightClick`
- `onRightMouseDown`
- `onRightMouseUp`
- `onRightDoubleClick`
- `onScrollUp`
- `onScrollDown`
- `onScrollClick`

`MouseEvent: { clientX, clientY, target, targetPosition}`: Object that
contains information about the click.

- `clientX`: The x coordinate relative to the entire screen where the mouse
  event occured.
- `clientY`: The y coordiante relative to the entire screen where the mouse
  event occured.
- `target`: The reference to the component's YogaNode.
- `targetPosition`: The corner positions of the component.
    - `{
	topleft: [number, number];
	topRight: [number, number];
	bottomLeft: [number, number];
	bottomRight: [number, number]
}`

---

#### Box leftActive and rightActive

These are props for the `Box` component which allow you to apply different
styles for when the left or right mouse is pressed down over the component.

```typescript
<Box
	width={10}
	borderStyle="round"
	leftActive={{
		borderColor: "blue",
	}}
	onClick={() => setCount(count + 1)}
>
	<Text>{count}</Text>
</Box>
```

<!-- left-active-demo.mp4 -->

https://github.com/user-attachments/assets/eea00621-319b-463f-a361-4b47edf05e9c

---

## Cli

Manage emitting events throughout the app with the `Cli` component.

```typescript
const commands = {
	greet: (args) => {
		if (!args[0]) {
			return Promise.reject("Provide a name!");
		} else {
			return `Hello, ${args[0]}!`;
		}
	},
	shell: (args) => {
		return new Promise((res, rej) => {
			const [cmd, ...cmdArgs] = args;
			execFile(cmd, cmdArgs, (err, stdout, stderr) => {
				err && rej(err);
				res(stdout || stderr);
			});
		});
	},
	DEFAULT: (args) => {
		return Promise.reject(`Unknown Command: ${args[0] ?? ""}`);
	},
} satisfies Commands;

useCommand("greet", (args) => {
	/*
	 * You can respond to commands with useCommand as well, but they won't
	 * have any effect on inputStyles, resolveStyles, or rejectStyles like
	 * the handlers in the Commands object does.
	 */
})

return (
	<Viewport flexDirection="column">
		<Box height="100" width="100"></Box>
		<Cli
			commands={commands}
			prompt={"~ > "}
			inputStyles={{
				italic: true,
				color: "magenta",
			}}
			rejectStyles={{
				color: "red",
				italic: true,
				dimColor: true,
			}}
			resolveStyles={{
				color: "green",
				italic: true,
				dimColor: true,
			}}
		/>
	</Viewport>
);

```

<!-- cli-demo.mp4 -->

https://github.com/user-attachments/assets/9d9d9f4c-3577-4f3c-afad-9bd54a0af64f

`Commands: { [command: string | 'DEFAULT']: CommandHandler }`
`CommandHandler: (args: string[], rawinput: string): string | Promise<unknown>`

- The `args` array is an array of all the words written to the cli `*after*` the
  command. The first word, the command itself, is omitted from the args array.
- The `rawinput` string is the raw input of everything _after_ the command was
  written to input.
- `CommandHandler`: When this returns a string or a Promise<string>, this sets
  the value of the Cli component. If a rejected Promise is returned, the
  rejectedStyles will be applied, and a resolved Promise, the resolvedStyles.
- The `DEFAULT` handler is a special handler that executes its callback when
  input does not match any command. Unlike the other handlers, `args` is an
  array of _all_ the words written to the cli.
- When a handler returns a string or number value (either directly or as the
  result of a Promise), that value is displayed as the CLI output after the
  command finishes.

`Controls`

- `:` opens the `Cli`
- `return`: executes the command
- `esc` closes the `Cli`
- `up arrow / down arrow`: Cycle through the history of commands entered within
  the current session.

If the handler returns nothing, the Cli is closed automatically.

`Required Props:`

- `commands:`: The `Commands` object.

`Optional Props:`

- `prompt`: The prompt visible when entering a command
    - Default: ":"
- `inputStyles, resolveStyles, rejectStyles`: Style the text differently based
  on the different scenarios.
- `persistPrompt: boolean`: When the Cli in inactive should the prompt be visible?
    - Default: `false`
- `actionPrompt`: See section on setting prompts and messages
- `message`: See section on setting prompts and messages

#### useCommand(commandName | 'DEFAULT', CommandHandler): void

The equivalent of `useEvent` but for events emitted from the Cli. Just like
useEvent, useCommand becomes inactive when the component dispatching it is not
focused.

#### Setting Prompts and Messages

The Cli component can accept an `actionPrompt` and `message` props which are
both tuples. The `actionPrompt` prop is there to prompt users for input, and
respond to that input, while the `message` prop sets the value of the Cli. Both
of these take effect when their references change, so the values for these props
should be state variables and should be initialized to undefined.

`actionPrompt: [string, (args: string[], rawinput: string) => Promise<unknown>]`

- The first index is the prompt that is shown when asking for user input.
- The second index is the callback that is executed when the input is received.
  Similar to the callbacks in the `Commands` object, the returned values set the
  value of the Cli component until the next stdin event, and style according to
  whether or not the callback rejected or resolved.

`message: ["INPUT" | "RESOLVE" | "REJECT", string]`

- The first index says how to style this message.
- The second index is the message itself

The message will be shown until the next stdin event.

---

#### CliModal

The `Cli` component but as a pop up modal. Accepts the same props as the
`Modal` component and `Cli` component, with the exception of the `actionPrompt`
and `message` props from the Cli component.

```typescript
<CliModal
	// Cli props
	commands={commands}
	prompt={"~ > "}
	persistPrompt
	inputStyles={{
		italic: true,
		color: "magenta",
	}}
	rejectStyles={{
		color: "red",
		italic: true,
		dimColor: true,
	}}
	resolveStyles={{
		color: "green",
		italic: true,
		dimColor: true,
	}}

	// Modal props
	borderStyle="round"
	width="75"
	titleTopCenter={{ title: " Command Line ", color: "green" }}
	borderColor="green"
/>
```

<!-- cli-modal-demo.mp4 -->

https://github.com/user-attachments/assets/9756e56f-0106-489a-a3b9-cf959b4dd178

---

### Viewport Component

A `Box` component that is set to the same dimensions as the terminal screen.

#### Props

All of the `Box` properties are available except for `height` | `width` |
`minHeight` | `minWidth` | `alignSelf`.

```typescript
return (
	<Viewport justifyContent="center" alignItems="center">
		<Text>Hello World!</Text>
	</Viewport>
);
```

---

### **StdinState Component**

```typescript
useKeymap({
	foo: { input: "F" },
	bar: { input: "B" },
	foobar: { input: "fb" },
});

/* ... */

return <StdinState
		showEvents={true}
		showRegister={true}
		eventStyles={{
			color: "green",
		}}
		registerStyles={{
			color: "blue",
		}}
		width={25}
	/>
```

<!-- stdin-state-demo.mp4 -->

https://github.com/user-attachments/assets/b6f39a00-85a5-495b-b473-c3bbe532a283

The `StdinState` component keeps track of stdin and emitted events and
displays them. This is useful because of the visual feedback it gives. For
example, if pressing 'a' doesn't trigger an event, it could be because the char
register was 'ja' at the time.

#### `Optional Props`:

- `showEvents: boolean`: Display event names when they are emitted?
    - Default: 'true'
- `showRegister: boolean`: Show keypresses in the char register?
- `eventStyles`: Value is an object that, if provided, styles the text of
  the displayed events.
- `registerStyles`: Value is an object that, if provided, styles the text of
  the displayed keypresses.
- `width: number`: How much space the component takes up. When an event is
  too long to fit inside this number, it is truncated.
    - Default: 20

---

### useShellCommand(): { exec }

- `Should be used along with the *preserveScreen* function`
  This hook returns a function called `exec` that runs a shell command and
  temporarily leaves the app to output the results.

- `exec(command: string, reattachedMessage?: string)`
    - The exec function returns a Promise with the exit status which is either a
      `number` or `null` based on whether or not the spawned command provides an
      exit status.
    - `reattachedMessage` is the text that is displayed in the terminal when the
      command is finished executing, prompting you to re-attach to the app.
        - Default: `press any key to continue`

```typescript
const { exec } = useShellCommand();

const commands = {
	exec: async (args) => {
		const command = args.join(" ");
		const exitStatus = await exec(command);
		if (exitStatus !== 0) {
			return Promise.reject(`Running shell command: exit status ${exitStatus}`);
		}
	},
	DEFAULT: (args) => {
		return Promise.reject(`Unknown Command: ${args[0] ?? ""}`);
	},
} satisfies Commands;

/* implement Cli component */
```

<!-- use-shell-command.mp4 -->

https://github.com/user-attachments/assets/51b244c6-1a16-4231-a488-2fbdb59a2c22

---

### VerticalLine / HorizontalLine Components

`Optional Props`:

- `length: string | number`: The height or width or the VerticalLine or
  Horizontal line respectively.
    - Default: `'100%'`
- `color`: The color of the line.
- `bold`: Increase thickness of the line.
- `dimColor`: Dim the color of the line.
- `char`: Build the line with a character of your own choosing.

```typescript
return <Box
		width="50"
		height="50"
		borderStyle="round"
		flexDirection="column"
		justifyContent="space-around"
	>
		<HorizontalLine />
		<HorizontalLine />
		<HorizontalLine />
	</Box>
```

```typescript
return <Box
		width="50"
		height="50"
		borderStyle="round"
		flexDirection="row"
		justifyContent="space-around"
	>
		<VerticalLine />
		<VerticalLine />
		<VerticalLine />
	</Box>

```

![horizontal-lines](https://github.com/user-attachments/assets/99b74e7b-1c60-4b04-80c9-293890ad92ad)

![vertical-lines](https://github.com/user-attachments/assets/60dd7013-aeb5-4e90-bedf-0ad2f298ba08)
