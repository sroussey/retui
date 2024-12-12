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

#### Focus
Focus is derived from the context provided by Page, List, Node, and Modal components. A component that has no context from any of these providers is assumed to be in focus, whereas if context is available, the component is considered focused only if all of its providers have it as focused.

#### Events
Events can be created with the `useKeymap` hook which accepts a keymap object and emits events when `stdin` matches a keymap. On every `stdin` event, every keymap object from every `useKeymap` hook is processed, but only if the component dispatching `useKeymap` is focused. If an event matches, the event is emitted throughout the entire app and can be responded to anywhere with the `useEvent` hook. Like the `useKeymap` hook, the `useEvent` hook will not respond to the event unless the component dispatching `useEvent` is focused. Once an event is emitted, any other `useKeymap` hooks waiting to process their keymap objects will be blocked until the next `stdin` event is received by the app.

#### Navigation
Pages, Lists, and Nodes handle page, 1D, and 2D navigation in the app. Each of these is tied to a hook that manages the focus state and provides a control utility that can control navigation and focus. Tying each of these components to a hook allows for less opinionated handling by exposing the state and utility functions that control them.

`Note:` This document won't go into detail about Box and Text components. The behave the same as in the original fork, so you can read the [Ink](https://github.com/vadimdemedes/ink) documentation which gives a detailed overview.  This document will only go over what is expanded on in this components.

`Note`: This document won't go into detail about the features available from the original fork.  Read about the features in the [Ink](https://github.com/vadimdemedes/ink) documentation which goes into detail about Box and Text components haven't changed aside from adding a few props.  Some of the packages made for `Ink` *might* work, but this library handles input differently so there are no gaurantees.

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
- If an array argument is provided, useList will manage state for you. A number argument states how many items will be included in the list.

#### Options:
- **`windowSize: "fit" | number`**
  - Default: `fit`
  - `'fit'`: Maximizes the number of list items displayed within the available cross-sectional space, based on the `unitSize` value. When `windowSize` is set to `'fit'`, `unitSize` defaults to `1`.
  - `number`: Sets the window size explicitly, up to the lesser of the provided number and the total number of list items. This option is most effective when paired with a `unitSize` of `'stretch'`. `unitSize` defaults to `'stretch'` when `windowSize` is set to a number.

- **`unitSize: "stretch" | number`**
 - Default: Defaults to `1` when `windowSize` is `'fit'`.  Defaults to `'stretch'` when `windowSize` is a number.
  - `number`: Assumes a fixed size for each list item's cross-sectional dimension. Displays as many items as possible based on this size.
  - `'stretch'`: Dynamically adjusts the size of the list items to fit within the available space. If `windowSize` is `'fit'`, displays as many possible items as possible and adjusts the size to shrink dynamically, down to a minimum `unitSize` of `1`.

- **`navigation: 'none' | 'vi-vertical' | 'vi-horizontal' | 'arrow-vertical' | 'arrow-horizontal'`**
  - Default: `'vi-vertical'`
  - `'none'`: No keymaps will control the list for you.  You can control
	navigation in the list with the `control` object returned from useList along with `useEvent`/`useKeymap`.
  - `'vi-vertical'`: `j`: down, `k`: up, `ctrl+d`: scroll down half window, `ctrl+u`: scroll up half window, `gg`: go to first index, `G`: go to last index, arrow keys also supported.
  - `'vi-horizontal'`: `h`: left, `l`: right, arrow keys also supported.
  - `'arrow-vertical'`: `up`: up, `down`: down.
  - `'arrow-horizontal'`: `left`: left, `right`: right.

- **`centerScroll: boolean`**
  - Default: `false`
  - Keeps the focused item in the center of the visible window slice when possible. This could be useful when a scrollbar isn't desired because it provides feedback when at the start/end of lists because the focused item will shift out of center.

<!-- list centerscroll demo -->
https://github.com/user-attachments/assets/ec816010-4d9f-46bc-a043-2f132569be03


- **`fallthrough: boolean`**
  - Default: `false`
  - Controls navigation behavior at list boundaries. If `true`, when focus reaches the end of the list, wraps around to the opposite end. If `false`, focus stops at the list boundaries and cannot move further.

<!-- list fallthrough demo -->
https://github.com/user-attachments/assets/869bae25-8cd5-43cc-bbac-0d8f9c6312e3

#### Return: { listView, control, items, setItems }
- **`listView`**: Required prop for List component.
- **`control`**: Utilities for controlling the list:
  - `currentIndex`: the current index that is focused.
  - `goToIndex(nextIdx: number, center?: boolean): void`: Shifts focus to a given index. If `center` is true, center the focus if possible.
  - `nextItem(): void`: Shift focus to the next list item.
  - `prevItem(): void`: Shift focus to the previous list item.
  - `scrollDown(n?: number): void`: Shifts focus down `n` items. If a number is not provided, shifts focus down half of the viewing slice.
  - `scrollUp(n?: number): void`: Opposite of `scrollDown`.

- **`items, setItems`**:
  - If an array was provided, these are the state related variables that useList is internally storing for you.
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
- **`item`**: The corresponding value in the `items` array for this list item node.
- **`items`**: The array responsible for rendering the list items.
- **`setItems`**: State action for updating the list items. If the `useList` hook is managing the state of the provided array, this is the setState function.
- **`index`**: The index of this node within the `items` array. Not to be confused with `control.currentIndex` which represents the current focused index of the List.
- **`isFocus`**: `true` if the index of this node matches the currently focused index in the list *and* the List itself is also focused.
- **`isShallowFocus`**: `true` if the node is focused relative to the List, but the List itself is not focused.
- **`control`**: The `control` object containing utilities for controlling the list.

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

`Note`: `useEvent` can also be imported, but you lose autocomplete unless a generic argument is provided.  The generic being the type of the object that satisfies the KeyMap type that the hook derives event names from.

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

#### useKeymap<T>(T: KeyMap, opts?: Opts): { useEvent<T> }
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


### useInput(handler: (input: string, key: Key) => unknown, opts: Opts)
Disregards focus and responds to stdin anywhere and anytime this hook is
dispatched.  Functions the same as the `useInput` hook in `Ink`.

---

### Pages / usePages
Pages are essentially just Lists with a windowSize of 1 and unitSize of
'stretch'.  There are no default keymaps to control navigation of pages.


































