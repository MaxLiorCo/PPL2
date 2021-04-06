import { isDefineExp,  isExp,  isProgram,  makePrimOp, makeVarDecl, makeVarRef, VarDecl, makeIfExp, makeProcExp, IfExp, ClassExp, ProcExp, Exp, Program, Binding, isClassExp, BoolExp, makeBoolExp, makeAppExp, makeStrExp, makeProgram, makeDefineExp } from "./L31-ast";
import { Result, makeOk } from "../shared/result";
import { first, isEmpty } from "../shared/list";
import { map } from "ramda"

/*
Purpose: Transform ClassExp to ProcExp
Signature: for2proc(classExp)
Type: ClassExp => ProcExp
*/

export const class2proc = (exp: ClassExp): ProcExp => {
    const args: VarDecl[] = exp.fields;
    return makeProcExp(args, [makeProcExp([makeVarDecl("msg")], [recurIfExp(exp.methods)])]);

}

/*
Recursively building the "ifExp".
*/
const recurIfExp = (bindings: Binding[]): IfExp | BoolExp => {
    return  isEmpty(bindings) ? makeBoolExp(false) :
            makeIfExp(makeAppExp(makePrimOp("eq?"), [makeVarRef("msg"), makeVarRef(`'${bindings[0].var.var}`)]),
                      makeAppExp(first(bindings).val, []),
                      recurIfExp(bindings.slice(1)));
}
    

/*
Purpose: Transform L31 AST to L3 AST
Signature: l31ToL3(l31AST)
Type: [Exp | Program] => Result<Exp | Program>
*/
export const L31ToL3 = (exp: Exp | Program): Result<Exp | Program> => 
    isExp(exp) ? isClassExp(exp) ? 
                    makeOk(class2proc(exp)) :
                                makeOk(exp) :
                makeOk(recProgExp(exp));
            
    // isClassExp(exp) ? makeOk(class2proc(exp)) :
    // isExp(exp) && !isProgram(exp) ? makeOk(exp) :
    // isProgram(exp) ? makeOk(recProgExp(exp)) : makeOk(makeStrExp("never"));

    
/*
This function traversing the array of expressions of the given program.
Via map ("ramda") we check whether the expression is "define" and if so, we check if its "val" is of type classExp.
If it is, we use "class2proc" to transfrom the "classExp" to a valid expression of L3.
If it isn't, thus it is a valid expression of L3 also, thus we use the same expression without change.
*/
export const recProgExp = (exp: Program): Program => {
    const newL3Exps = map(expression => isDefineExp(expression) ? 
                                            isClassExp(expression.val) ? 
                                                makeDefineExp((expression.var), class2proc(expression.val)) :
                                                expression :
                                        expression , exp.exps);
    return makeProgram(newL3Exps);
}
