import { makeIfExp, makeProcExp, IfExp, ClassExp, ProcExp, Exp, Program, Binding, isClassExp, BoolExp, makeBoolExp, makeAppExp, isProcExp } from "./L31-ast";
import { Result, makeFailure, bind, makeOk } from "../shared/result";
import { isBinding,  makePrimOp,  makeStrExp, makeVarDecl, makeVarRef, StrExp, VarDecl } from "../imp/L3-ast";
import { isEmpty } from "../shared/list";

/*
Purpose: Transform ClassExp to ProcExp
Signature: for2proc(classExp)
Type: ClassExp => ProcExp
*/

export const class2proc = (exp: ClassExp): ProcExp => {
    const args: VarDecl[] = exp.fields;
    //const innerProcExp = makeProcExp([makeVarDecl("msg")], makeIfExp())
    return makeProcExp(args, [makeProcExp([makeVarDecl("msg")], [recurIfExp(exp.methods)])]);

}

const recurIfExp = (bindings: Binding[]): IfExp | BoolExp => {
    // console.log("var" + bindings[0].var.var);
    // console.log("val: " + bindings[0].val);
    


    return  isEmpty(bindings) ? makeBoolExp(false) :
            //makeIfExp(makeStrExp(`(eq? msg '${bindings[0].var.var})`), bindings[0].val, recurIfExp(bindings.slice(1)));
            makeIfExp(makeAppExp(makePrimOp("eq?"), [makeVarRef("msg"), makeVarRef(`'${bindings[0].var.var}`)]),
                        isProcExp(bindings[0].val) ? makeStrExp(`(${makeProcExp((bindings[0].val.args), bindings[0].val.body)})`) : bindings[0].val,
                        recurIfExp(bindings.slice(1)))

}
    

/*
Purpose: Transform L31 AST to L3 AST
Signature: l31ToL3(l31AST)
Type: [Exp | Program] => Result<Exp | Program>
*/
export const L31ToL3 = (exp: Exp | Program): Result<Exp | Program> =>
    isClassExp(exp) ? makeOk(class2proc(exp)) : 
    makeOk(exp);
