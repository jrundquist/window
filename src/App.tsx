import * as React from "react";
import {init} from "./add.cpp";

interface Props {

}

export const App: React.FunctionComponent<Props> = ({}) => {

  const [additionResult, setAdditionResult]= React.useState<number>(0);
  React.useEffect(() => {
    init<AddModule>().then((module) => {
      (window as any)['module'] = module;
      setAdditionResult(module.exports.add(1, 20))
    });
  }, [setAdditionResult]);

 return (<div>1 + 20 = {additionResult}</div>);
};
