import * as React from "react"

import type { ToastActionElement, ToastProps } from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

type ActionType = typeof actionTypes

type Action = 
  | { type: ActionType["ADD_TOAST"]; toast: ToasterToast }
  | { type: ActionType["UPDATE_TOAST"]; toast: Partial<ToasterToast> }
  | { type: ActionType["DISMISS_TOAST"]; toastId?: ToasterToast["id"] }
  | { type: ActionType["REMOVE_TOAST"]; toastId?: ToasterToast["id"] }

interface State {
  toasts: ToasterToast[]
}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case actionTypes["DISMISS_TOAST"]:
      const { toastId } = action

      // ! Side effects ! - Should be in a middleware/effect/saga
      if (toastId) {
        return {
          ...state,
          toasts: state.toasts.map((t) =>
            t.id === toastId ? { ...t, open: false } : t
          ),
        }
      } else {
        return {
          ...state,
          toasts: state.toasts.map((t) => ({ ...t, open: false })),
        }
      }

    case actionTypes["REMOVE_TOAST"]:
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
    default:
      return state
  }
}

const listeners: ((state: State) => void)[] = []

const toaster = {
  state: { toasts: [] } as State,
  getState: () => toaster.state,
  subscribe: (listener: (state: State) => void) => {
    listeners.push(listener)
    return () => {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  },
  dispatch: (action: Action) => {
    toaster.state = reducer(toaster.state, action)
    listeners.forEach((listener) => listener(toaster.state))
  },
}

type Toast = Pick<ToasterToast, "id" | "duration" | "promise">
let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

function createToast(props: ToastProps): Toast {
  const {
    closeButton,
    children,
    className,
    description,
    duration = 5000,
    id = genId(),
    onOpenChange,
    title,
    unstyled,
    viewports,
    ...rest
  } = props;

  const toast: ToasterToast = {
    ...rest,
    id,
    title,
    description,
    action: props.action,
    open: true,
    onOpenChange: (open) => {
      if (!open) {
        toaster.dispatch({
          type: actionTypes.DISMISS_TOAST,
          toastId: id,
        })
      }
      onOpenChange?.(open)
    },
  }

  toaster.dispatch({ type: actionTypes.ADD_TOAST, toast })

  return {
    id: toast.id,
    duration: toast.duration,
  }
}

function useToast() {
  const [state, setState] = React.useState<State>(toaster.getState)

  React.useEffect(() => {
    return toaster.subscribe(setState)
  }, [])

  return {
    ...state,
    toast: createToast,
    dismiss: (toastId?: string) =>
      toaster.dispatch({ type: actionTypes.DISMISS_TOAST, toastId }),
  }
}

export { useToast, createToast }
