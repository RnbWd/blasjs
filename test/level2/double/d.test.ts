import { assert, expect } from 'chai';
import * as blas from '../../../src/lib';
import { approximately, approximatelyWithPrec } from '../../test-helpers';
import { fixture } from './fixtures';

const {
  util: {
    arrayrify,
    numberPrecision,
    each,
    multiplexer,
    fortranArrComplex64,
    fortranMatrixComplex64,
    complex,
    muxCmplx
  },
  level2: {
    sgbmv,
    sgemv,
    sger
  }
} = blas;

const { abs } = Math;
const { isNaN, isFinite } = Number;

describe('blas level 2 single/double precision', function n() {

  describe('sgbmv', () => {

    describe('data tests', () => {
      const { sgbmv: testData } = fixture;

      each(testData)(({ input: {
        trans,
        m,
        n,
        kl,
        ku,
        alpha,
        a,
        lda,
        x,
        incx,
        beta,
        y,
        incy
      }, output: expect, desc }, key) => {
        it(`[${key}]/[${desc}]`, function t() {

          const aM = fortranMatrixComplex64(muxCmplx(a))(lda, n);
          const sx = fortranArrComplex64(muxCmplx(x))();
          const sy = fortranArrComplex64(muxCmplx(y))();

          sgbmv(trans, m, n, kl, ku, alpha, aM, lda, sx, incx, beta, sy, incy);
          //console.log({ sy });
          multiplexer(sy.toArr(), expect.y)(approximately);
        });
      });
    });

    describe('test errors', () => {
      const { sgbmvErrors: errors } = fixture;

      each(errors)(({ input: {
        trans,
        m,
        n,
        kl,
        ku,
        alpha,
        a,
        lda,
        x,
        incx,
        beta,
        y,
        incy
      }, desc }, key) => {
        it(`[${key}]/[${desc}]`, function t() {

          const aM = fortranMatrixComplex64(muxCmplx(a))(0, 0);
          const sx = fortranArrComplex64(muxCmplx(x))();
          const sy = fortranArrComplex64(muxCmplx(y))();

          const call = () => sgbmv(trans, m, n, kl, ku, alpha, aM, lda, sx, incx, beta, sy, incy);
          //call();
          expect(call).to.throw();
        });
      });
    });
  });
  describe('sgemv', () => {

    describe('data tests', () => {
      const { sgemv: testData } = fixture;

      each(testData)(({ input: {
        trans,
        m,
        n,
        alpha,
        a,
        lda,
        x,
        incx,
        beta,
        y,
        incy
      }, output: expect, desc }, key) => {
        it(`[${key}]/[${desc}]`, function t() {

          const aM = fortranMatrixComplex64(muxCmplx(a))(lda, n);
          const sx = fortranArrComplex64(muxCmplx(x))();
          const sy = fortranArrComplex64(muxCmplx(y))();

          //console.log({ am: Array.from(aM.r) });
          sgemv(trans, m, n, alpha, aM, lda, sx, incx, beta, sy, incy);
          // console.log({ sy: sy.toArr() });
          multiplexer(sy.toArr(), expect.y)(approximatelyWithPrec(1E-6));
        });
      });
    });
  });

  describe('sger', () => {
    describe('data tests', () => {
      const { sger: testData } = fixture;
      each(testData)(({ input: {
        m,
        n,
        alpha,
        a,
        lda,
        x,
        incx,
        y,
        incy
      }, expect, desc }, key) => {
        it(`[${key}]/[${desc}]`, function t() {

          const aM = fortranMatrixComplex64(muxCmplx(a))(lda, n);
          const sx = fortranArrComplex64(muxCmplx(x))();
          const sy = fortranArrComplex64(muxCmplx(y))();
          const eA = fortranMatrixComplex64(muxCmplx(expect.a))(m, n);

          sger(m, n, alpha, sx, incx, sy, incy, aM, lda);
          //console.log({ a: aM.slice(1, m, 1, n).r });
          multiplexer(Array.from(aM.slice(1, m, 1, n).r), eA.r)(approximatelyWithPrec(1E-7));

        });
      });
    });

    describe('error tests', () => {
      const { sgerError: testData } = fixture;
      each(testData)(({ input: {
        m,
        n,
        lda,
        incx,
        incy
      }, desc }, key) => {
        it(`[${key}]/[${desc}]`, function t() {

          const aM = fortranMatrixComplex64(muxCmplx([0]))(1, 1);
          const sx = fortranArrComplex64(muxCmplx([0]))();
          const sy = fortranArrComplex64(muxCmplx([0]))();

          const call = () => sger(m, n, 0, sx, incx, sy, incy, aM, lda);

          expect(call).to.throw();


        });
      });
    });
  });
});

