// modified version of 'vux' tools

function format(originalDate, dateFormat = 'YYYY-MM-DD HH:mm:ss') {
  let date = originalDate;
  let fmt = dateFormat;
  if (typeof date === 'string') {
    date = new Date(date.replace(/-/g, '/'));
  }
  if (typeof date === 'number') {
    date = new Date(date);
  }
  const o = {
    'M+': date.getMonth() + 1,
    'D+': date.getDate(),
    'h+': date.getHours() % 12 === 0 ? 12 : date.getHours() % 12,
    'H+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds(),
    'q+': Math.floor((date.getMonth() + 3) / 3),
    S: date.getMilliseconds(),
  };
  const week = {
    0: '\u65e5',
    1: '\u4e00',
    2: '\u4e8c',
    3: '\u4e09',
    4: '\u56db',
    5: '\u4e94',
    6: '\u516d',
  };
  if (/(Y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (String(date.getFullYear())).substr(4 - RegExp.$1.length));
  }
  if (/(E+)/.test(fmt)) {
    let prefix;
    if (RegExp.$1.length > 1) {
      prefix = RegExp.$1.length > 2 ? '\u661f\u671f' : '\u5468';
    } else {
      prefix = '';
    }
    const replaced = `${prefix}${week[String(date.getDay())]}`;
    fmt = fmt.replace(RegExp.$1, replaced);
  }
  const keys = Object.keys(o);
  keys.forEach((k) => {
    if (new RegExp(`(${k})`).test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : ((`00${o[k]}`).substr(String(o[k]).length)));
    }
  });
  return fmt;
}

export default {
  format,
};
