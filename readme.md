## Phileas

#### A terminal UI library with a focus on events, keymaps, and navigation.  A fork of [Ink](https://github.com/vadimdemedes/ink).

Easily manages:
- dynamically sized lists
- pages
- 1d and 2d navigation
- keymaps
- text input
- z-indexes
- modals
- in-app command lines
- click events
- styling options such as background colors and titles
-
### Overview

#### Focus Focus is derived from the context provided by Page, List, Node, and
Modal components. A component that has no context from any of these providers is
assumed to be in focus, whereas if context is available, the component is
considered focused only if all of its providers have it as focused.

#### Events Events can be created with the `useKeymap` hook which accepts a
keymap object and emits events when `stdin` matches a keymap. On every `stdin`
event, every keymap object from every `useKeymap` hook is processed, but only if
the component dispatching `useKeymap` is focused. If an event matches, the event
is emitted throughout the entire app and can be responded to anywhere with the
`useEvent` hook. Like the `useKeymap` hook, the `useEvent` hook will not respond
to the event unless the component dispatching `useEvent` is focused. Once an
event is emitted, any other `useKeymap` hooks waiting to process their keymap
objects will be blocked until the next `stdin` event is received by the app.

#### Navigation Pages, Lists, and Nodes handle page, 1D, and 2D navigation in
the app. Each of these is tied to a hook that manages the focus state and
provides a control utility that can control navigation and focus. Tying each of
these components to a hook allows for less opinionated handling by exposing the
state and utility functions that control them.

`Note`: This document won't go into detail about the features available from the
original fork.  Read about these in the
[Ink](https://github.com/vadimdemedes/ink) documentation which goes into detail
about `Box` and `Text` components.  Only features additional features from this
library will be detailed. Some of the packages made for `Ink` *might* work, but
this library handles input differently.

---

### List / useList

#### Example
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

### `useList(itemsOrLength, Options): Return`

#### itemsOrLength: any[] | number
- If an array argument is provided, useList will manage state for you. A number
  argument states how many items will be included in the list.

#### Options:
- **`windowSize: "fit" | number`**
  - Default: `fit`
  - `'fit'`: Maximizes the number of list items displayed within the available
	cross-sectional space, based on the `unitSize` value. When `windowSize` is
	set to `'fit'`, `unitSize` defaults to `1`.
  - `number`: Sets the window size explicitly, up to the lesser of the provided
	number and the total number of list items. This option is most effective
	when paired with a `unitSize` of `'stretch'`. `unitSize` defaults to
	`'stretch'` when `windowSize` is set to a number.

- **`unitSize: "stretch" | number`**
 - Default: Defaults to `1` when `windowSize` is `'fit'`.  Defaults to
   `'stretch'` when `windowSize` is a number.
  - `number`: Assumes a fixed size for each list item's cross-sectional
	dimension. Displays as many items as possible based on this size.
  - `'stretch'`: Dynamically adjusts the size of the list items to fit within
	the available space. If `windowSize` is `'fit'`, displays as many possible
	items as possible and adjusts the size to shrink dynamically, down to a
	minimum `unitSize` of `1`.

- **`navigation: 'none' | 'vi-vertical' | 'vi-horizontal' | 'arrow-vertical' |
  'arrow-horizontal'`**
  - Default: `'vi-vertical'`
  - `'none'`: No keymaps will control the list for you.  You can control
	navigation in the list with the `control` object returned from useList along
	with `useEvent`/`useKeymap`.
  - `'vi-vertical'`: `j`: down, `k`: up, `ctrl+d`: scroll down half window,
	`ctrl+u`: scroll up half window, `gg`: go to first index, `G`: go to last
	index, arrow keys also supported.
  - `'vi-horizontal'`: `h`: left, `l`: right, arrow keys also supported.
  - `'arrow-vertical'`: `up`: up, `down`: down.
  - `'arrow-horizontal'`: `left`: left, `right`: right.

- **`centerScroll: boolean`**
  - Default: `false`
  - Keeps the focused item in the center of the visible window slice when
	possible. This could be useful when a scrollbar isn't desired because it
	provides feedback when at the start/end of lists because the focused item
	will shift out of center.

<!-- list centerscroll demo -->
https://github.com/user-attachments/assets/ec816010-4d9f-46bc-a043-2f132569be03


- **`fallthrough: boolean`**
  - Default: `false`
  - Controls navigation behavior at list boundaries. If `true`, when focus
	reaches the end of the list, wraps around to the opposite end. If `false`,
	focus stops at the list boundaries and cannot move further.

<!-- list fallthrough demo -->
https://github.com/user-attachments/assets/869bae25-8cd5-43cc-bbac-0d8f9c6312e3

#### Return: { listView, control, items, setItems }
- **`listView`**: Required prop for List component.
- **`control`**: Utilities for controlling the list:
  - `currentIndex`: the current index that is focused.
  - `goToIndex(nextIdx: number, center?: boolean): void`: Shifts focus to a
	given index. If `center` is true, center the focus if possible.
  - `nextItem(): void`: Shift focus to the next list item.
  - `prevItem(): void`: Shift focus to the previous list item.
  - `scrollDown(n?: number): void`: Shifts focus down `n` items. If a number is
	not provided, shifts focus down half of the viewing slice.
  - `scrollUp(n?: number): void`: Opposite of `scrollDown`.

- **`items, setItems`**:
  - If an array was provided, these are the state related variables that useList
	is internally storing for you.
  - If an array was not provided, this is a dummy array of `null`.

---

### List
The viewing window that contains list items, which are the child nodes of the
component.  The List component has a height and width of 100% of its parent
container, so it needs a parent container to inherit dimensions from.  If a
column List has a height of 0, then no list items will be rendered.

#### Required Props:
- **`listView`**: The object recieved from useList

#### Optional Props
- **`flexDirection: 'row' | 'column'`**: 'column' renders the list items vertically,
  while 'row' renders the list items horizontally
	- Default: 'column'
- **`scrollbar`**: Value is a config object that styles the scrollbar
	- **`hide?: boolean`**: Show or hide the scrollbar
		- Default: `false`
	- **`color?: string`**: Color of the scrollbar
		- Default: `undefined`
	- **`dimColor?: boolean`**:
		- Default: `false`
	- **`style?: 'single' | 'bold' : { char: string }`**: The thickness of the
	  scrollbar.  Add your own style with the config object option
	- **`align?: 'start' | 'end'`**: 'start' aligns on the left and top of
	  column and row lists respectively and 'end' the right and bottom.
	  	- Default: `end`
- **`justifyContent: 'flex-start' | 'center' | flex-end' | 'space-between' |
  'space-around'`**: Control how the list items are displayed within the viewing window.
	- Default: `flex-start`
- **`alignItems: 'flex-start' | 'center' | 'flex-end`**: Control how the list
  items are displayed within the viewing window.
  	- Default: `flex-start`
- **`gap: number`**: The `gap` between list items.
	- Default: `0`

---

### `useListItem<T>(): { item, items, setItems, index, control, isFocus, isShallowFocus }`
Returns data about the list-rendered component and the list.

#### Generic Argument:
- **`<T>`**: Represents the type of the items in the `items` array.
	- Default: `any`

#### Properties:
- **`item`**: The corresponding value in the `items` array for this list item
  node.
- **`items`**: The array responsible for rendering the list items.
- **`setItems`**: State action for updating the list items. If the `useList`
  hook is managing the state of the provided array, this is the setState
  function.
- **`index`**: The index of this node within the `items` array. Not to be
  confused with `control.currentIndex` which represents the current focused
  index of the List.
- **`isFocus`**: `true` if the index of this node matches the currently focused
  index in the list *and* the List itself is also focused.
- **`isShallowFocus`**: `true` if the node is focused relative to the List, but
  the List itself is not focused.
- **`control`**: The `control` object containing utilities for controlling the
  list.

---
### List: windowSize and unitSize examples

#### **Fixed windowSize with unitSize of 'stretch'**.

`Note:` When windowSize is a number, unitSize will default to 'stretch'.


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

`Note:` When windowSize is set to 'fit', unitSize defaults to 1.

If unitSize is a fixed number, then all list items are assumed to have that
dimension. Excess height could lead to improper fit.  This is why the wrap
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

### useKeymap, useEvent, useInput
This example continues on from the `List` example.

`Note`: `useEvent` can also be imported, but you lose autocomplete unless a
generic argument is provided.  The generic being the type of the object that
satisfies the KeyMap type that the hook derives event names from.

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

All events are derived from the same input stream.  Once an event has been
matched, no other `useKeymap` hook can mutate the event that will be emitted
until the the next input is recieved.

#### useKeymap<T>(T: KeyMap, opts?: Opts): { useEvent<T> }
<!-- Clean up this section -->
The useKeymap hook can be placed within any component and it will only process
its `KeyMap` object if the component is focused.  The `useKeymap` hook along with
the `useEvent` hook allow you to define and handle keymaps that are specific to
the component they exist in.  This means you can handle events anywhere in your
app without needing to track global indices or states.

Events are emitted with `node:events`, so any event can be responded to anywhere
with any `useEvent` hook as long as that hook is focused.

Beyond handling localized keymaps and events, `useKeymap` can also provide event
emitting for events that are relevant throughout the entire app.

#### KeyMap: { [eventName: string]: KeyInput | KeyInput[] }
The keys in the `KeyMap` object are the names of the events that will be emitted
when stdin finds a match.

- **`KeyInput`**: { key?: Key; input?: string; notKey?: Key[]; notInput?: string[] }
	- **`Key`**: Non alphanumeric keys
	- **`input`**: Any combination of alphanumeric keys.
	- **`notKey`**: Any input *except* the Keys in this array will trigger this
	  event
	- **`notInput`**: Any input *except* the strings in this array will trigger
	  this event.

#### Opts
- **`priority`**: `never` | `always` | `default` | `override` | `textinput`
	- Default: `default`
	- Sets priority levels for useKeymap hooks so that control can be passed
	  between different hook instances.  This allows you to keep separate
	  keybind configurations while not interrupting operations such as filling
	  out form fields. Or maybe you want to temporarily override your normal
	  settings.
	- `always` and `never` do not interfere with other priority levels
	- `override` overrides anything set to default
	- `textinput` overrides everything inlcuding `always`

#### useEvent<T>(eventName: keyof T, handler: (char: char) => unknown, additionalFocusCheck?: boolean = true)
- **`eventName`**: The event derived from the keys of the `KeyMap` object
- **`handler`**: The last keypress that triggered the event.
- **`additionalFocusCheck`**: When false, the specific hook will not respond to
  any events.
  -	Default: `true`


#### useInput(handler: (input: string, key: Key) => unknown, opts: Opts)
Disregards focus and responds to stdin anywhere and anytime this hook is
dispatched.  Functions the same as the `useInput` hook in `Ink`.


#### setCharRegisterSize(num: number): void
By default, the app stores up to 2 non-alphanumeric chars before resetting to an
empty string.  Once an event is emitted, the register resets again.  If this
default size of 2 is not desired, you can set it with the `setCharRegisterSize`
size which accepts any positive number as an argument.

#### RegisterState component
The `RegisterState` component keeps track of stdin and emitted events and
displays them.  This is useful because of the visual feedback it gives.  For
example, if pressing 'a' doesn't trigger an event, it could be because the char
register was 'ja' at the time.


---

### Pages / usePages
Pages are just Lists with a windowSize of 1 and unitSize of 'stretch'.  There
are no default keymaps to control navigation of pages.  If you want your app to
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

### `usePages(amountOfPages: number, opts?: Opts): { pageView, control }`

**`amountOfPages`**: The number of pages must match how many pages are rendered.

**`Opts`**: { fallthrough: boolean }
- Default: `false`
- The same as in the `useList` hook.

**`pageView`**:  Required prop for `Pages` component.

**`control`**: Utilities for controlling the Pages component.
- **`currentPage`**: the current index that is focused.
- **`goToPage(num: number)`**: Go to a page with specified index.
- **`nextPage`**: Shift focus to the next page.
- **`prevPage`**: Shift focus to the previous page.

---

### `Page`

#### Props:
**`pageView`**: The object recieved from `usePages`.

---

### Viewport
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

### `Node / useNodeMap `

`useNodeMap` is a utility for managing 2-dimensional navigation.  It maps nodes to
specific coordinates which enables intuitive navigation.  Like Pages and Lists,
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

#### `useNode(nodeMap: NodeMap, opts? Opts): { register, control, nodesView, node }`

**`NodeMap`**: This is the 2d string array that navigation is derived from.  An
empty string is considered a `null` space in the `NodeMap`.

Maps do not need to follow a strict width.  This is valid.

```typescript
const nodemap1 = [
	["1"],
	["2", "3", "4"],
	["5"]
]
```

Nodes can extend cells.  This is also valid.

<!-- *should* also be able to extend cells.  This actually works as you would
expect, but I can't remember if I designed it for this, so I'm not sure if there
is a configuration that might cause it to break. Added to the todo -->

```typescript
const nodemap2 = [
	["1", "2"],
	["1", "3"],
	["1", "4"]
]
```

**`Opts**: { initialFocus?: string; navigation?: 'vi' | 'arrow' | 'none' }`
- **`initialFocus`**: The name of the node that you want focused initially.
  If not provided, the first non-empty string is used.
- **`navigation`**: The default navigation keymaps provided.
	- Default: `vi`
	- **`vi`**: h,j,k,l and also arrow keys
	- **`arrow`**: arrow keys
	- **`none`**: Handle yourself with the `control` object

**`Return`**: { register, control, nodesView, node }
- **`register(nodeName: string)`**: The function used to register a `Node`
  component to the `NodeMap`.  Not strictly necessary to use this
  function, but convenient.  It returns `{ name: string; nodesView: NodeView
  }` which are required props for the `Node` component
- **`nodesView`**: Required prop for the `Node` component.
- **`node`**: The name of the current node that is focused.
- **`control`**: Utilities for controlling the state of the map.
	- **`next(): string`**: Go to the next available node.  This is like
	  pressing tab in the browser when filling out a form.  Returns the
	  name of the focused node after the operation.
	- **`prev(): string`**: Opposite of `next`
	- **`goToNode(node: string | number): string`**: Shift focus directly to
	  the provided node.  If argument is a string, this should correlate to
	  one of the nodes in the NodeMap.  If argument is a number, this is the
	  nth node in the map, if you were to count starting at the top left
	  corner and ending at the bottom right corner.
	- **`left(): string`**: Shift focus left.  Returns the name of the
	  focused node after the operation after the operation.
	- **`right(): string`**: Shift focus right.  Returns the name of the
	  focused node after the operation after the operation.
	- **`up(): string`**: Shift focus up.  Returns the name of the focused
	  node after the operation after the operation.
	- **`down(): string`**: Shift focus down.  Returns the name of the
	  focused node after the operation after the operation.
	- **`getSize(): number`**: Returns the count of all the nodes.
	- **`getLocation(): string`**: The name of the currently focused node.
	- **`getIteration(): number`**: The *index* of the currently focused
	  node.

#### `Node`

Passes the state of the `NodeMap` to its child components, which includes the
focus status of the node with the given name.

```typescript
<Node nodesView={nodesView} name={"foo"}>
	<FooComponent />
</Node>
```

*or*

```typescript
<Node {...register("foo")}>
	<FooComponent />
</Node>
```

**`Props`**

**`Required`**:
- **`nodesView`**: The object returned from useNodeMap
- **`name`**: The name of the node.

#### `Node.Box`

Because it might be helpful or might lead to less jsx nesting in certain
situations, the `Node` component can be extended to include all of the props as
a `Box` component.

```typescript
<Node.Box nodesView={nodesView} name={"foo"} >
	<FooComponent />
</Node.Box>
```

#### `useNode<T extends string = string>(): { name, isFocus, isShallowFocus, control}`

Returns context about the `Node` we are rendering.
- **`name`**: The name of the Node we are rendering.
- **`isFocus`**: If the current Node is focused *and* the component containing the
`useNodeMap` hook is also focused.
- **`isShallowFocus`**:  If the current Node is focused but the component
containing the `useNodeMap` hook is *not* focused.
- **`control`**: The same control object return from `useNodeMap`.

---

### `TextInput / useTextInput`

```typescript
function TextInputDemo(): React.ReactNode {
    const { onChange, setValue } = useTextInput("");

    const onExit = (value: string) => {
        // Do something with the value when done inserting text
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

#### `useTextInput(initialValue?: string): { onChange, value, setValue, insert, enterInsert }`
- **`onChange`**: Function that is a required prop to the `TextInput` component.
- **`value`**: The current string value of the text.
- **`setValue(nextValue: string, insert?: boolean)`**: Utility function that
  updates the value to a specificed value
	- The optional `insert` defaults to not change whatever insert value it has
	  currently, but when set explicitly, controls the insert value in the next
	  state.
- **`enterInsert()`**: Utility function that puts you into insert mode.

#### `TextInput`

##### `Required Props`:
- **`onChange`**: Function returned form `useTextInput`.

##### `Optional Props`:
- **`enterKeymap: KeyInput`**:
	- Default: [{ key: "return" }, { input: "i" }]
- **`exitKeymap: KeyInput`**:
	- Default [{ key: "return" }, { key: "esc" }]
- **`onExit(value: string, char: string): unknown`**: Allows you to do
  something with the value when exiting insert mode.
  	- `char` is the key that triggered the `TextInput` to exit insert.
- **`onEnter(value: string, char: string)`**: Allows you to do something with
  the value when entering insert mode.
  	- `char` is the key that triggered the `TextInput` to enter insert.
- **`onKeypress(char: string)`**: Called on every keypress event when inserting
  text.
- **`onUpArrow() / onDownArrow`**: Control what happens when these keys are
  pressed while inserting text.  Could be used to shift focus.
- **`textStyles`**: Style the displayed text
- **`cursorColor`**: Color the cursor block
- **`autoEnter`**: When focus is gained, does TextInput automatically enter
  insert mode?
	- Default: `false`

---

### `Box Styling`

#### `styles? Styles["Box"]`
- Default: `undefined`
- This is an object that contains all of the styles available to `Box`
  components *except* the `styles` prop.  Useful in the case you have multiple
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

#### `backgroundColor?: string | 'inherit'`
Colors the background color of a Box.  When set to `inherit`, if the immediate
parent has a backgroundColor prop set, it will inherit from the parent.
- Default: `undefined`

---

#### `titleTopLeft, titleTopCenter, titleTopRight, titleBottomLeft, titleBottomCenter, titleBottomRight`
Applies a title in the specified location.  The only required prop is `title`.
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

#### `zIndex?: 'auto' | number`
- Default: `'auto' (equivalent to 0)`
- Sets the render order of a Box component.  `zIndex` is only relative to the
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

---

<!-- zindex-demo.png -->

#### `wipeBackground?: boolean`
- Default: `false`
Clears the background of a Box component.  When a zIndex is set, this happens by
default.  Can be a drain on performance if this happens too often.

---

### Mouse Events
Mouse event handlers can be attached to `Box` components and to any
`titleTopLeft, titleTopCenter, etc...` prop object on a Box.

Requires manually telling the app to listen for mouse input events with the
**`setMouseReporting(b: boolean)`** function.

**`IMPORTANT**: Mouse events are only accurate if the app is using the entire
screen, so if you aren't using the *Viewport* component, clicks will not be
accurate`.

All handlers accept a **`MouseEventHandler`**

- **`onClick`**
- **`onDoubleClick`**
- **`onMouseDown`**
- **`onMouseUp`**
- **`onRightClick`**
- **`onRightMouseDown`**
- **`onRightMouseUp`**
- **`onRightDoubleClick`**
- **`onScrollUp`**
- **`onScrollDown`**
- **`onScrollClick`**

**`MouseEventHandler: (e: MouseEvent) => unknown `**

**`MouseEvent: { clientX, clientY, target, targetPosition}`**: Object that
contains information about the click.
- **`clientX`**: The x coordinate relative to the entire screen where the mouse
  event occured.
- **`clientY`**: The y coordiante relative to the entire screen where the mouse
  event occured.
- **`target`**: The reference to the component's YogaNode.
- **`targetPosition`**: The corner positions of the component.
	- `{
			topleft: [number, number];
			topRight: [number, number];
			bottomLeft: [number, number];
			bottomRight: [number, number]
		}`


---

### `Box leftActive and rightActive`
These are props for the `Box` component which allow you to apply different
styles for when the left or right mouse is pressed down over the component.

---

### Cli

Manage emitting events throughout the app with the command-line.

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
	// You can respond to events with useCommand as well.
	// But they won't have any effect on the inputStyles, rejectStyles, or resolveStyles
})

return (
	<Viewport flexDirection="column">
		<Box height="100" width="100"></Box>
		<Cli
			prefix={"~ > "}
			commands={commands}
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

**`Commands: { [command: string]: CommandHandler }`**
**`CommandHandler: (args: string[])`**

The returned string or number value, or Promise result, of the `CommandHandler`
is what is outputted to the `Cli` component after a command is executed.

**`Controls`**
- `:` opens the `Cli`
- `return`: executes the command
- `esc` closes the `Cli`

If a `CommandHandler` returns nothing, the `Cli` is closed automatically

**`Props`**
- `commands: **required**`: The `Commands` object.
- `prefix`: The prompt visible when entering a command
- `inputStyles, resolveStyles, rejectStyles`: Style the text differently based
  on the different scenarios.


#### `CliModal`
The `Cli` component but as a pop up modal.  Accepts the same props as the
`Modal` component.

```typescript
<CliModal
	prefix={"~ > "}
	persistPrefix
	borderStyle="round"
	width="75"
	titleTopCenter={{ title: " Command Line ", color: "green" }}
	borderColor="green"
	commands={commands}
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
```
<!-- cli-modal-demo.mp4 -->
https://github.com/user-attachments/assets/9756e56f-0106-489a-a3b9-cf959b4dd178

---

### Modals
Modals position themselves relative to their parent component and have a default
`zIndex` of 1.
























































