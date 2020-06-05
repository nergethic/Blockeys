let gl: WebGLRenderingContext;

class BufferGeometry {
    attrubuteNames: string[];
    attributes: BufferAttribute[];

    constructor() {
        this.attrubuteNames = new Array();
        this.attributes = new Array();
    }

    SetAttribute(attribName: string, attribData: BufferAttribute) {
        let index : number = this.attrubuteNames.indexOf(attribName);
        if (index >= 0) {
            let attrib = this.attributes[index];
            attrib.Bind();
            attrib.SendData(attribData.data);
        } else {
            this.attrubuteNames.push(attribName);
            this.attributes.push(attribData);
        
            attribData.Bind();
            attribData.SendData(attribData.data);
        }
    }
}

class MaterialData {

}

class BufferAttribute {
    buffer: WebGLBuffer;
    data: Float32Array;

    constructor(data: Float32Array, count: number) {
        this.buffer = gl.createBuffer();

    }

    Bind() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    }

    SendData(data: Float32Array) {
        this.data = data;
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    }
}

class BufferUniform {
    MergeBufferWith(uniforms: BufferUniform) {
        
    }
}

class Material {
    constructor(uniforms: BufferUniform, vertexShader: string, fragmentShader: string) {

    }
}

let basicMaterialVertexShader: string = "";
let basicMaterialFragmentShader: string = "";

class MeshBasicMaterial extends Material {
    constructor(uniforms: BufferUniform) {
        // uniforms.MergeBufferWith();
        super(uniforms ,basicMaterialVertexShader, basicMaterialFragmentShader);
    }
}

class Mesh {
    constructor(geometry: BufferGeometry, material: Material) {

    }
}

class Color {
    r: number;
    g: number;
    b: number;

    constructor(r: number, g: number, b: number) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
}

function GetTestMesh(): Mesh {
    let geometry = new BufferGeometry();
    let vertices = new Float32Array([
        -1.0, -1.0,  1.0,
         1.0, -1.0,  1.0,
         1.0,  1.0,  1.0,
    
         1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,
        -1.0, -1.0,  1.0
    ]);

    geometry.SetAttribute('position', new BufferAttribute(vertices, 3));
    let material = new MeshBasicMaterial(new BufferUniform());
    let mesh = new Mesh( geometry, material );

    return mesh;
}