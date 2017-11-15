import { InputObservable } from '../InputObservable'

describe('InputObservable class', () => {
  const inputElements = [document.createElement('input')]

  describe('data formatter', () => {
    let reduceFieldSpy: any
    beforeEach(() => {
      reduceFieldSpy = jest.spyOn(InputObservable.prototype, 'reduceField')
    })

    it('should call reduceField when format standard input', () => {
      const obs = new InputObservable({ inputElements })
      obs.standardInputFormatter({ target: { name: 'test', value: 'test' } })
      expect(reduceFieldSpy).toHaveBeenCalledWith('test', 'test')
    })

    it('should call reduceField when format checkbox input', () => {
      const obs = new InputObservable({ inputElements })
      obs.checkboxInputFormatter({ target: { name: 'test', value: 'test', checked: true } })
      expect(reduceFieldSpy).toHaveBeenCalledWith('test', true)
    })
  })

  describe('field reducer', () => {
    it('should properly format data', () => {
      expect(InputObservable.prototype.reduceField('test', 'test')).toEqual({
        test: {
          dirty: true,
          touched: true,
          value: 'test',
        },
      })
    })
  })
})

//   describe('data format', () => {
//   it('should properly format data', () => {
//     const DecoratedComponent = rxForm<SimpleFormProps>({
//       fields: {
//         test: {},
//       },
//       valueChangeObs: true,
//     })(SimpleForm)
//     const mounted: any = mount(<DecoratedComponent onSubmit={onSubmit} />)
//     const instance = mounted.instance()

//     expect(instance.reduceFieldData('test', 'testValue', false, true)).toEqual({
//       test: {
//         dirty: false,
//         touched: true,
//         value: 'testValue',
//       },
//     })
//     expect(instance.reduceFieldData('test', 'otherValue')).toEqual({
//       test: {
//         dirty: true,
//         touched: true,
//         value: 'otherValue',
//       },
//     })
//   })
// })
