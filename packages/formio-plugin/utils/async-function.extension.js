export class AsyncFunction extends Function {
  constructor(...args) {
    const bodyCode = args.pop();
    args.push(`return (async () => { ${bodyCode} })()`);
    super(...args);
  }
}