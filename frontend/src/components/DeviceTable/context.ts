import React from "react";
import {FormInstance} from "antd";

export const EditableContext = React.createContext<FormInstance<any> | null>(null);
