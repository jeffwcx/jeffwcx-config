import {
  type InquirerReadline,
  type KeypressEvent,
  Separator,
  type Theme,
  createPrompt,
  isBackspaceKey,
  isEnterKey,
  makeTheme,
  useEffect,
  useKeypress,
  useMemo,
  usePagination,
  usePrefix,
  useRef,
  useState,
} from '@inquirer/core';
import chalk from 'chalk';
import figures from '@inquirer/figures';
import ansiEscapes from 'ansi-escapes';
import type { PartialDeep } from '@inquirer/type';

type SelectTheme = {
  icon: {
    checked: string;
    unchecked: string;
    cursor: string;
  };
  style: {
    disabledChoice: (text: string) => string;
    renderSelectedChoices: <T>(
      selectedChoices: ReadonlyArray<Choice<T>>,
      allChoices: ReadonlyArray<Choice<T> | Separator>,
    ) => string;
  };
  helpMode: 'always' | 'never' | 'auto';
};

const checkboxColor = chalk.green;

const selectTheme: SelectTheme = {
  icon: {
    checked: `[${checkboxColor(figures.tick)}]`,
    unchecked: '[ ]',
    cursor: '>',
  },
  style: {
    disabledChoice: (text: string) => chalk.dim(`- ${text}`),
    renderSelectedChoices: (selectedChoices) =>
      selectedChoices.map((choice) => choice.name || choice.value).join(', '),
  },
  helpMode: 'auto',
};

export type Choice<Value> = {
  name?: string;
  value: Value;
  disabled?: boolean | string;
  checked?: boolean;
  type?: never;
};

type Config<Value> = {
  message: string;
  prefix?: string;
  pageSize?: number;
  instructions?: string | boolean;
  source: (input?: string) => Promise<ReadonlyArray<Choice<Value> | Separator>>;
  loop?: boolean;
  required?: boolean;
  defaultFilterValue?: string;
  equals?: (target: Value, souce: Value) => boolean;
  validate?: (
    items: ReadonlyArray<Item<Value>>,
  ) => boolean | string | Promise<string | boolean>;
  theme?: PartialDeep<Theme<SelectTheme>>;
};

enum Status {
  PENDING = 'pending',
  READY = 'ready',
  DONE = 'done',
}

type Item<Value> = Separator | Choice<Value>;

/**
 * The isUpKey and isDownKey functions from inquirer include a check for j/k keys and we don't want that here
 */
function isUpKey(key: KeypressEvent) {
  return key.name === 'up';
}

function isDownKey(key: KeypressEvent) {
  return key.name === 'down';
}

function isTabKey(key: KeypressEvent) {
  return key.name === 'tab';
}

function isSelectable<Value>(item: Item<Value>): item is Choice<Value> {
  return !Separator.isSeparator(item) && !item.disabled;
}

function toggle<Value>(item: Item<Value>): Item<Value> {
  return isSelectable(item) ? { ...item, checked: !item.checked } : item;
}

export const select = createPrompt(
  <Value>(config: Config<Value>, done: (value: Array<Value>) => void) => {
    const {
      instructions,
      pageSize = 10,
      loop = false,
      source,
      required,
      defaultFilterValue = '',
      validate = () => true,
      equals = (a, b) => a === b,
    } = config;
    const theme = makeTheme<SelectTheme>(selectTheme, config.theme);
    const [status, setStatus] = useState(Status.PENDING);
    const isLoading = status === Status.PENDING;
    const prefix = usePrefix({ theme, isLoading });
    const [displayList, setDisplayList] = useState<ReadonlyArray<Item<Value>>>(
      [],
    );

    const [active, setActive] = useState(0);
    const [showHelpTip, setShowHelpTip] = useState(true);
    const [errorMsg, setError] = useState<string>();
    const filterTask = useRef<Promise<void>>();
    const [filterValue, setFilterValue] = useState<string>(defaultFilterValue);
    const [selection, setSelection] = useState<Choice<Value>[]>([]);

    const bounds = useMemo(() => {
      const first = displayList.findIndex(isSelectable);
      const last = displayList.findLastIndex(isSelectable);
      return { first, last };
    }, [displayList]);

    function select(active: number, rl: InquirerReadline) {
      const targetChoice = displayList[active];
      if (isSelectable(targetChoice)) {
        if (targetChoice.checked) {
          const currentSelection = selection.filter(
            (choice) => !equals(targetChoice.value, choice.value),
          );
          setSelection(currentSelection);
        } else {
          selection.push({ ...targetChoice });
        }
        rl.clearLine(0);
        setFilterValue('');
      }
      setDisplayList(
        displayList.map((choice, i) => {
          return i === active ? toggle(choice) : choice;
        }),
      );
    }

    function filter() {
      setStatus(Status.PENDING);
      setError(undefined);
      const currentTask = source(filterValue);
      filterTask.current = currentTask
        .then((choices) => {
          if (choices.length <= 0) {
            setDisplayList([]);
            return;
          }
          setDisplayList(
            choices.map((choice) => {
              const finalChoice = { ...choice };
              if (isSelectable(finalChoice)) {
                selection.some((item) => {
                  if (equals(item.value, finalChoice.value)) {
                    finalChoice.checked = true;
                    return true;
                  }
                  return false;
                });
              }
              return finalChoice;
            }),
          );
          setActive(0);
        })
        .catch((err) => {
          setError(err);
        })
        .finally(() => {
          setStatus(Status.READY);
        });
    }

    useEffect(filter, [filterValue]);

    useKeypress(async (key, rl) => {
      if (status !== Status.READY) {
        return;
      }
      setShowHelpTip(false);
      if (isEnterKey(key)) {
        if (filterValue) {
          return;
        }
        const isValid = await validate([...selection]);
        if (required && selection.length < 0) {
          setError('At least one choice must be selected');
        } else if (isValid === true) {
          setStatus(Status.DONE);
          done(selection.map((choice) => choice.value));
        } else {
          setError(isValid || 'You must select a valid value');
        }
      } else if (isBackspaceKey(key) && !filterValue) {
        setFilterValue('');
        setSelection(selection.slice(0, selection.length - 1));
      } else if (isUpKey(key) || isDownKey(key)) {
        if (bounds.first < 0) return;
        if (
          loop ||
          (isUpKey(key) && active !== bounds.first) ||
          (isDownKey(key) && active !== bounds.last)
        ) {
          const offset = isUpKey(key) ? -1 : 1;
          let next = active;
          do {
            next = (next + offset + displayList.length) % displayList.length;
          } while (!isSelectable(displayList[next]!));
          setActive(next);
        }
      } else if (isTabKey(key)) {
        setError(undefined);
        select(active, rl);
      } else {
        setError(undefined);
        setFilterValue(rl.line);
      }
    });

    const message = theme.style.message(config.message);

    const page =
      displayList.length <= 0
        ? `${theme.style.highlight(figures.info)} ${theme.style.message('No results.')}`
        : usePagination<Item<Value>>({
            items: displayList,
            active,
            renderItem({
              item,
              isActive,
            }: {
              item: Item<Value>;
              isActive: boolean;
            }) {
              if (Separator.isSeparator(item)) {
                return ` ${item.separator}`;
              }

              const line = item.name || item.value;
              if (item.disabled) {
                const disabledLabel =
                  typeof item.disabled === 'string'
                    ? item.disabled
                    : '(disabled)';
                return theme.style.disabledChoice(`${line} ${disabledLabel}`);
              }

              const checkbox = item.checked
                ? theme.icon.checked
                : theme.icon.unchecked;
              const color = isActive ? theme.style.highlight : (x: string) => x;
              const cursor = isActive ? theme.icon.cursor : ' ';
              return color(`${cursor}${checkbox} ${line}`);
            },
            pageSize,
            loop,
          });

    const answer = theme.style.answer(
      theme.style.renderSelectedChoices(selection, displayList),
    );

    if (status === Status.DONE) {
      return `${prefix} ${message} ${answer}`;
    }

    let helpTipTop = '';
    let helpTipBottom = '';
    if (
      theme.helpMode === 'always' ||
      (theme.helpMode === 'auto' &&
        showHelpTip &&
        (instructions === undefined || instructions))
    ) {
      if (typeof instructions === 'string') {
        helpTipTop = instructions;
      } else {
        const keys = [
          `${theme.style.key('tab')} to select`,
          `${theme.style.key('enter')} to proceed`,
        ];
        helpTipTop = ` (Press ${keys.join(', ')})`;
      }

      if (
        displayList.length > pageSize &&
        (theme.helpMode === 'always' || theme.helpMode === 'auto')
      ) {
        helpTipBottom = `\n${theme.style.help('(Use arrow keys to reveal more choices)')}`;
      }
    }

    let error = '';
    if (errorMsg) {
      error = `\n${theme.style.error(errorMsg)}`;
    }

    const formattedInputText = `\n${theme.style.highlight('>>')} ${answer ? `${answer} ` : ''}${
      filterValue
        ? theme.style.message(filterValue) + figures.square
        : figures.square +
          theme.style.help('type to filter or press enter to proceed')
    }`;

    let content = '';
    if (status !== Status.PENDING) {
      content = `${formattedInputText}\n${page}${helpTipBottom}`;
    }

    return `${prefix} ${message}${helpTipTop}${content}${error}${ansiEscapes.cursorHide}`;
  },
);

export { Separator } from '@inquirer/core';
