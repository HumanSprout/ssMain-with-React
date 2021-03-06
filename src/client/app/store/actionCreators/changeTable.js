import {
  // event keys
  SELECT_TABLE,
  // utils
  prepDataToRender
} from '../';

export const changeTable_dispatch = data => render => dispatch => {
  dispatch(render(data));
  dispatch({
    type: SELECT_TABLE,
    value: data.view
  });
};

export const changeTable = data => changeTable_dispatch(data)(prepDataToRender);
