"use client";

import { Provider } from "react-redux";
import { store } from "./store";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function StoreProvider({ children }: Props) {
  return <Provider store={store}>{children}</Provider>;
}
