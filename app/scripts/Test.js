export default class Test {

  constructor() {

    console.log('---')

    this.test = 'salut';

    // console.log(this.test);

    // this.hello();
    // console.log(this);

    window.setTimeout(this.timeout.bind(this), 500);
  }
  timeout() {
    console.log("Hola");
  }
  hello() {
    // console.log(this);
    console.log(this.test);
  }

}

export class Test2 {

  constructor() {

    console.log('---2')
  }

  maFunction() {


  }

}
export class Test3 {

  constructor() {

    console.log('---3')
  }

  maFunction() {


  }

}
