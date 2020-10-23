<template>
	<div id="ui">
		<div
			id="editor"
			:style="`background: ${backgroundColors[currentBackground]}`"
		>
			<p
				contenteditable
				id="content"
				@input="onInput"
				:style="`font-size: ${this.calcFontSize}px`"
			></p>
		</div>
		<div id="control">
			<div id="colors">
				<button
					class="color-btn"
					:class="{ '--selected': currentBackground == i }"
					:style="`background: ${backgroundColors[i]}`"
					@click="setBackground(i)"
					v-for="(color, i) in backgroundColors"
					:key="i"
				/>
			</div>
			<div id="action">
				<button
					id="cancel"
					@click="cancel"
					style="margin-right: 4px;"
					v-html="'Cancel'"
				/>

				<button id="create" @click="create" v-html="'Add'" />
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'App',
	data() {
		return {
			text: String,
			fontSize: Number,
			currentBackground: 0,
			backgroundColors: ['#7BDBFF', '#FF9083', '#CFA8FF', '#5CE3B1']
		}
	},
	methods: {
		// Handle input. V-model binding not supported with contenteditable
		onInput(e) {
			this.text = e.target.innerText
		},
		// Set background color
		setBackground(color) {
			this.currentBackground = color
		},
		// Create sticky note
		create() {
			const content = this.text
			const fontSize = this.calcFontSize / 1.3
			// 1.3 is the scale factor UI -> generated sticky note.
			// Goal is to match the font size across UI and Figma board
			const background = this.backgroundColors[this.currentBackground]

			parent.postMessage(
				{
					pluginMessage: {
						type: 'create-note',
						content,
						fontSize,
						background
					}
				},
				'*'
			)

			// Erase content for new sticky note
			document.getElementById('content').innerHTML = ''
			this.text = ''
		},
		// Exit plugin
		cancel() {
			parent.postMessage(
				{
					pluginMessage: {
						type: 'cancel'
					}
				},
				'*'
			)
		}
	},
	computed: {
		calcFontSize() {
			const fontSize = 42
			return Math.round(fontSize - this.text.length * 0.15)
		}
	},
	mounted() {
		// Make sure that pasted content also gets formatted (font-size)
		document
			.querySelector('[contenteditable]')
			.addEventListener('paste', function _listener(event) {
				event.preventDefault()
				document.execCommand(
					'inserttext',
					false,
					event.clipboardData.getData('text/plain')
				)
				document.removeEventListener('paste', _listener)
			})
	}
}
</script>

<style>
/* Global */

#app {
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
}
body {
	font: 12px sans-serif;
	text-align: center;
}

/* App */

#ui {
	width: 100%;
	margin: 0 auto;
}

#editor {
	width: 100%;
	height: 246px;
	margin: 0 auto;
	background: #eee;
	border: 1px solid #eee;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: background-color 0.2s;
}

#content {
	width: calc(100vw - 64px);
}

[contenteditable] {
	outline: 2px solid #18a0fb;
}

/* Display content placeholder when content is empty */
[contentEditable='true']:empty:not(:focus):before {
	content: 'Text';
	color: rgba(0, 0, 0, 0.5);
	font-style: italic;
	font-weight: 300;
	pointer-events: none; /* Prevent placeholder from blocking @click */
}

/* UI */

#control {
	margin-top: 8px;
	display: flex;
	align-items: center;
	flex-direction: row;
	justify-content: space-between;
}

button {
	min-width: 28px;
	height: 28px;
	padding-left: 12px;
	padding-right: 12px;

	background: white;
	outline: none;
	border: none;
	border-radius: 5px;
	box-shadow: inset 0 0 0 1px black;
	color: black;
}

.color-btn {
	border: none;
	border-radius: 100%;
	box-shadow: none;
}

.color-btn:not(:last-child) {
	margin-right: 4px;
}

#create {
	box-shadow: none;
	background: #18a0fb;
	color: white;
}

/* Modifiers */

.--selected {
	box-shadow: inset 0 0 0 2px #18a0fb !important;
}
</style>
