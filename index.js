class Promise {
  constructor (executor){
    this.status='pending'
    this.value=''
    this.resolveCallbacks=[]
    this.rejectCallbacks=[]
    let me=this
    function resolve(val) {
      //  resolve(promise)  借刀杀人  看最后面的promise表现
      if(val instanceof Promise){
        val.then(resolve,reject)
        return
      }
      if(me.status==='pending'){
        me.status='onFulfilled'
        me.value=val
        //异步情况 -->  稍后执行回调
        me.resolveCallbacks.forEach(item=>{
          item(me.value)
        })
      }
    }


    function reject(err){
      if(me.status=='pending'){
        me.status='onRejected'
        me.value=err
        me.rejectCallbacks.forEach(item=>{
          item(me.value)
        })
      }
    }
    executor(resolve,reject)
  }

  then(onFulfiled,onRejected){
    //处理newPromise和返回值的关系
    function resolvePromise (newPromise,x,resolve,reject) {
      if(x instanceof Promise){
        //异步是等待态
        if(x.status==='pending'){
          x.then(function (y) {
            resolvePromise(newPromise,y,resolve,reject)
          },function (err) {
            reject(err)
          })
        }else{
          x.then(function (data){
            resolve(data)
          },function (err) {
            reject(err)
          })
        }
      }else{
        resolve(x)
      }
    }
    let newPromise
    //同步情况
    if(this.status=='onFulfilled'){
      let me=this
      return newPromise=new Promise(function (resolve,reject) {
        let x=onFulfiled(me.value)
        resolvePromise(newPromise,x,resolve,reject)
      })
    }
    if(this.status=='onRejected'){
      let me=this
      return newPromise=new Promise(function (resolve,reject) {
        let x=onRejected(me.value)
        resolvePromise(newPromise,x,resolve,reject)
      })
    }


    //异步情况
    if(this.status=='pending'){
      let me=this
      return newPromise=new Promise(function (resolve,reject) {
        me.resolveCallbacks.push( function() {
          let x=onFulfiled(me.value)
          resolvePromise(newPromise,x,resolve,reject)
        })

        me.rejectCallbacks.push( function() {
          let x=onRejected(me.value)
          resolvePromise(newPromise,x,resolve,reject)
        })
      })
    }
  }
}

module.exports=Promise