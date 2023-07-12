function binomial(n, k) {
    w = [1];
    for (let i=1; i<n+1; i++) w.push(w[i-1]*(n-i+1)/i);
    return w[k];
}

function Bernstein(n,i,t){
    let coeff = math.pow(2,n)/(binomial(n,n/2)*(n+1));
    let ti = 2*i*math.pi/(n+1);
    return coeff*math.pow(math.cos((t-ti)/2),n);
} 

function Bezier(values, t){
    let n = values.length-1;
    var N = 0;
 
    for (let i=0; i<n+1; i++){
        N = N + Bernstein(n,i,t) * values[i];
    }
    return N;
}



function point_on_bezier(curve, weight, t){
    let n = curve.length-1;
    var Xs = [];
    var Ys = [];
    for (let i=0; i < n+1; i++){
        Xs.push(weight[i]*curve[i].x);
        Ys.push(weight[i]*curve[i].y);
    }
    var Nx = Bezier(Xs, t);
    var Ny = Bezier(Ys, t);
    var d = Bezier(weight, t);
    
    return new Point(Nx/d, Ny/d);
}

function bezierToBarycentric(curve, weight, T){
    let n = T.length-1;
    var Q = [];
    var beta = [];

    for (let i=0; i < n+1; i++){
        Q.push(point_on_bezier(curve, weight, T[i]));
        beta.push(Bezier(weight, T[i]));
    }
    return [Q, beta];
}

function barycentricToBezier(Q, beta, T){
    let n = T.length-1;
    var M = [];
    for(var i=0; i<n+1; i++) {
        M[i] = [];
        for(var j=0; j<n+1; j++) {
            M[i][j] = Bernstein(n,j,T[i]);
        }
    }

    var Xs = [];
    var Ys = [];
    for (let i=0; i < n+1; i++){
        Xs.push(beta[i]*Q[i].x);
        Ys.push(beta[i]*Q[i].y);
    }
    M = math.inv(M);
    var Nx = math.multiply(M,Xs);
    var Ny = math.multiply(M,Ys);
    var alpha = math.multiply(M,beta);

    P = []
    for (let i=0; i<n+1;i++){
        P.push(new Point(Nx[i]/alpha[i], Ny[i]/alpha[i]));
    }
    return [P,alpha];
}