<template>
  <div class="wrapper">
    <div
      class="note"
      :style="`background: ${backgroundColors[currBackgroundIndex]}`"
    >
      <p
        contenteditable
        class="note-content"
        ref="noteContent"
        @input="onInput"
        :style="`font-size: ${this.calcFontSize}px`"
      ></p>
    </div>
    <div class="flex row align-items-center justify-content-between m-xxsmall">
      <div class="flex row align-items-center">
        <div
          v-for="(color, i) in backgroundColors"
          :key="i"
          class="color"
          :class="{ 'color--selected': currBackgroundIndex == i }"
          :style="`background: ${backgroundColors[i]}`"
          @click="setBackground(i)"
        />
      </div>
      <div class="flex ml-xxsmall" style="width: 100%">
        <FigButton style="width: 100%" primary v-on:click="createNote">
          Add
        </FigButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { FigButton } from 'figma-plugin-ds-vue';

export default Vue.extend({
  name: 'App',
  data() {
    return {
      text: '',
      currBackgroundIndex: 0,
      backgroundColors: ['#7BDBFF', '#FF9083', '#CFA8FF', '#5CE3B1']
    };
  },
  components: {
    FigButton
  },
  methods: {
    // handle input. v-model binding not supported with contenteditable
    onInput(event: MouseEvent): void {
      const target = event.target as HTMLElement;
      if (event.target !== null) {
        this.text = target.innerText;
      }
    },
    setBackground(color: number): void {
      this.currBackgroundIndex = color;
    },
    createNote(): void {
      const content = this.text;
      // 1.3 is the scale difference between plugin ui -> figma canvas
      const fontSize = this.calcFontSize / 1.3;
      const background = this.backgroundColors[this.currBackgroundIndex];
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
      );
      // remove content and reset to placeholder
      (this.$refs.noteContent as HTMLInputElement).innerHTML = '';
      this.text = '';
    },
    cancelApp(): void {
      parent.postMessage(
        {
          pluginMessage: {
            type: 'cancel'
          }
        },
        '*'
      );
    },
    // event handlers
    handlePaste(event: ClipboardEvent) {
      event.preventDefault();
      event.stopPropagation();

      if (event.clipboardData !== null) {
        document.execCommand(
          'inserttext',
          false,
          event.clipboardData.getData('text/plain')
        );
      }
    }
  },
  computed: {
    calcFontSize(): number {
      const fontSize = 38;
      return Math.round(fontSize - this.text.length * 0.15); // 0.15 works good
    }
  },
  mounted() {
    // FIXME
    // eslint-disable-next-line
    this.$el.addEventListener('paste', (this as any).handlePaste);
  },
  beforeDestroy() {
    // FIXME
    // eslint-disable-next-line
    this.$el.removeEventListener('paste', (this as any).handlePaste);
  }
});
</script>

<style lang="scss">
.wrapper {
  width: 300px;
  height: 300px;
  margin: 0 auto;
}

.note {
  width: 100%;
  height: 252px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: #eee;
  position: relative;
  transition: background-color 0.2s;
  overflow: hidden;

  &-content {
    width: calc(100vw - 64px);
  }
}

// note textarea
[contenteditable] {
  cursor: default;

  &:hover {
    text-decoration: underline;
    text-decoration-color: var(--blue);
  }

  &:focus {
    outline: 2px solid #18a0fb;
    text-decoration: none;
  }
}

// display content placeholder when content is empty
[contentEditable='true']:empty:not(:focus):before {
  content: 'Text';
  color: rgba(0, 0, 0, 0.5);
  font-style: italic;
  font-weight: 300;
  pointer-events: none; // prevent placeholder from blocking @click
}

// misc
.color {
  display: inline-block;
  min-width: 28px;
  height: 28px;
  outline: none;
  border: none;
  border-radius: 100%;
  box-shadow: none;

  &:not(:last-child) {
    margin-right: var(--size-xxxsmall);
  }

  // modifiers
  &--selected {
    box-shadow: inset 0 0 0 2px #18a0fb !important;
  }
}
</style>
